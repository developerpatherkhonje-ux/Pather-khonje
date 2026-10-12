const express = require('express');
const Package = require('../models/Package');
const PackageCalculatorSettings = require('../models/PackageCalculatorSettings');
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');

const router = express.Router();

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getPackageDays = (pkg, fallbackNights) => {
  const itineraryDays = Array.isArray(pkg?.itinerary) ? pkg.itinerary.length : 0;
  if (itineraryDays > 0) return itineraryDays;
  const match = String(pkg?.duration || '').match(/\d+/);
  if (match) return Number(match[0]);
  return Number(fallbackNights || 0) + 1;
};

const calculateEstimate = (settings, pkg, input = {}) => {
  const defaults = settings.defaults || {};
  const adults = Math.max(toNumber(input.adults, defaults.adults || 2), 1);
  const children = Math.max(toNumber(input.children, defaults.children || 0), 0);
  const pax = adults + children;
  const nights = Math.max(toNumber(input.nights, defaults.nights || 1), 0);
  const days = Math.max(toNumber(input.days, getPackageDays(pkg, nights)), nights + 1);
  const vehicleCount = Math.max(toNumber(input.vehicleCount, defaults.vehicleCount || 1), 1);
  const emptySeats = Math.max(toNumber(input.emptySeats, defaults.emptySeats || 0), 0);
  const rooms = Math.max(toNumber(input.rooms, defaults.rooms || Math.ceil(pax / 2)), 1);
  const sharingKey = input.sharing || defaults.sharing || 'double';
  const vehicleKey = input.vehicleType || defaults.vehicleType || 'suv';
  const selectedMeals = Array.isArray(input.meals)
    ? input.meals
    : (settings.mealOptions || []).filter((meal) => meal.defaultIncluded).map((meal) => meal.key);

  const override = (settings.packageOverrides || []).find((item) => String(item.package) === String(pkg?._id || pkg?.id)) || {};
  const rules = { ...(settings.costRules?.toObject?.() || settings.costRules || {}), ...override };
  const sharing = (settings.roomSharing || []).find((item) => item.key === sharingKey) || settings.roomSharing?.[1] || {};
  const vehicle = (settings.vehicleOptions || []).find((item) => item.key === vehicleKey) || settings.vehicleOptions?.[0] || {};
  const mealList = settings.mealOptions || [];

  const hotelBase = rooms * nights * toNumber(rules.hotelPerRoomNight, 0);
  const sharingMultiplier = toNumber(sharing.multiplier, 1);
  const extraBedCost = Math.max(pax - (rooms * toNumber(sharing.personsPerRoom, 2)), 0) * nights * toNumber(sharing.extraBedRate, 0);
  const hotelCost = Math.round((hotelBase * sharingMultiplier) + extraBedCost);

  const transportCost = Math.round(
    vehicleCount * days * (
      toNumber(vehicle.perDayCost, 0) +
      toNumber(vehicle.driverAllowance, 0) +
      toNumber(vehicle.fuelBuffer, 0) +
      toNumber(rules.parkingTollPerDay, 0)
    ),
  );
  const emptySeatCharge = Math.round(emptySeats * days * toNumber(vehicle.perDayCost, 0) * (toNumber(rules.emptySeatChargePercent, 0) / 100));

  const childMealPercent = toNumber(rules.childMealPercent, 60) / 100;
  const mealCost = Math.round(mealList
    .filter((meal) => selectedMeals.includes(meal.key))
    .reduce((sum, meal) => sum + (days * toNumber(meal.perPersonCost, 0) * (adults + children * childMealPercent)), 0));

  const childActivityPercent = toNumber(rules.childActivityPercent, 70) / 100;
  const sightseeingCost = Math.round(toNumber(rules.sightseeingPerPerson, 0) * (adults + children * childActivityPercent));
  const permitsCost = Math.round(toNumber(rules.permitsPerPerson, 0) * pax);
  const guideCost = Math.round(toNumber(rules.guidePerDay, 0) * days);
  const baseCost = hotelCost + transportCost + emptySeatCharge + mealCost + sightseeingCost + permitsCost + guideCost;
  const contingency = Math.round(baseCost * (toNumber(rules.contingencyPercent, 0) / 100));
  const netCost = baseCost + contingency;
  const marginPercent = toNumber(input.marginPercent, override.marginPercent ?? defaults.marginPercent ?? 0);
  const margin = Math.round(netCost * (marginPercent / 100));
  const beforeGst = netCost + margin;
  const includeGst = input.includeGst !== undefined ? Boolean(input.includeGst) : Boolean(defaults.includeGst);
  const gstPercent = toNumber(input.gstPercent, defaults.gstPercent || 0);
  const gst = includeGst ? Math.round(beforeGst * (gstPercent / 100)) : 0;
  const total = beforeGst + gst;

  return {
    package: pkg ? { id: pkg._id, name: pkg.name, duration: pkg.duration, route: pkg.route, price: pkg.price } : null,
    input: { adults, children, pax, nights, days, rooms, sharing: sharingKey, vehicleType: vehicleKey, vehicleCount, emptySeats, meals: selectedMeals, marginPercent, gstPercent, includeGst },
    breakdown: {
      hotelCost,
      transportCost,
      emptySeatCharge,
      mealCost,
      sightseeingCost,
      permitsCost,
      guideCost,
      contingency,
      netCost,
      margin,
      gst,
      total,
      perPerson: pax > 0 ? Math.ceil(total / pax) : total,
    },
    notes: settings.notes,
  };
};

router.get('/settings/public', async (req, res, next) => {
  try {
    const settings = await PackageCalculatorSettings.getDefault();
    const packages = await Package.find({ isActive: true }).select('name slug duration price route itinerary image images').sort({ name: 1 }).lean();
    res.json({
      success: true,
      data: {
        settings,
        packages: packages.map((pkg) => ({
          id: pkg._id,
          name: pkg.name,
          slug: pkg.slug,
          duration: pkg.duration,
          price: pkg.price,
          route: pkg.route,
          days: getPackageDays(pkg, settings.defaults?.nights),
          image: pkg.image || pkg.images?.[0],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/calculate', async (req, res, next) => {
  try {
    const settings = await PackageCalculatorSettings.getDefault();
    const pkg = req.body.packageId ? await Package.findById(req.body.packageId).lean() : null;
    const estimate = calculateEstimate(settings, pkg, req.body);
    res.json({ success: true, data: estimate });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', authenticateToken, requireAdmin, requirePermission('settings:manage'), async (req, res, next) => {
  try {
    const settings = await PackageCalculatorSettings.getDefault();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', authenticateToken, requireAdmin, requirePermission('settings:manage'), async (req, res, next) => {
  try {
    const settings = await PackageCalculatorSettings.findOneAndUpdate(
      { key: 'default' },
      { ...req.body, key: 'default', updatedBy: req.user?._id },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
