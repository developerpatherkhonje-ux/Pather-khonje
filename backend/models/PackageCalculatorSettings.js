const mongoose = require('mongoose');

const packageCalculatorSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    defaults: {
      nights: { type: Number, default: 3 },
      adults: { type: Number, default: 4 },
      children: { type: Number, default: 0 },
      rooms: { type: Number, default: 2 },
      sharing: { type: String, default: 'double' },
      vehicleType: { type: String, default: 'suv' },
      vehicleCount: { type: Number, default: 1 },
      emptySeats: { type: Number, default: 0 },
      marginPercent: { type: Number, default: 18 },
      gstPercent: { type: Number, default: 5 },
      includeGst: { type: Boolean, default: true },
    },
    roomSharing: [
      {
        key: String,
        label: String,
        personsPerRoom: Number,
        extraBedRate: Number,
        multiplier: Number,
      },
    ],
    vehicleOptions: [
      {
        key: String,
        label: String,
        capacity: Number,
        perDayCost: Number,
        driverAllowance: Number,
        fuelBuffer: Number,
      },
    ],
    mealOptions: [
      {
        key: String,
        label: String,
        perPersonCost: Number,
        defaultIncluded: Boolean,
      },
    ],
    costRules: {
      hotelPerRoomNight: { type: Number, default: 2200 },
      childMealPercent: { type: Number, default: 60 },
      sightseeingPerPerson: { type: Number, default: 450 },
      guidePerDay: { type: Number, default: 900 },
      permitsPerPerson: { type: Number, default: 150 },
      parkingTollPerDay: { type: Number, default: 350 },
      contingencyPercent: { type: Number, default: 5 },
      childActivityPercent: { type: Number, default: 70 },
      emptySeatChargePercent: { type: Number, default: 35 },
    },
    packageOverrides: [
      {
        package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
        hotelPerRoomNight: Number,
        sightseeingPerPerson: Number,
        guidePerDay: Number,
        permitsPerPerson: Number,
        parkingTollPerDay: Number,
        marginPercent: Number,
      },
    ],
    notes: {
      type: String,
      default: 'Estimate is indicative. Final package depends on hotel availability, season, vehicle permit, route condition and final itinerary.',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

packageCalculatorSettingsSchema.statics.getDefault = async function() {
  let settings = await this.findOne({ key: 'default' });
  if (!settings) {
    settings = await this.create({
      key: 'default',
      roomSharing: [
        { key: 'single', label: 'Single sharing', personsPerRoom: 1, extraBedRate: 0, multiplier: 1.85 },
        { key: 'double', label: 'Double sharing', personsPerRoom: 2, extraBedRate: 0, multiplier: 1 },
        { key: 'triple', label: 'Triple sharing', personsPerRoom: 3, extraBedRate: 700, multiplier: 1.18 },
        { key: 'quad', label: 'Quad sharing', personsPerRoom: 4, extraBedRate: 600, multiplier: 1.28 },
      ],
      vehicleOptions: [
        { key: 'hatchback', label: 'Hatchback / Sedan', capacity: 4, perDayCost: 3200, driverAllowance: 500, fuelBuffer: 400 },
        { key: 'suv', label: 'SUV / Bolero / Scorpio', capacity: 6, perDayCost: 4500, driverAllowance: 600, fuelBuffer: 600 },
        { key: 'tempo', label: 'Tempo Traveller', capacity: 12, perDayCost: 7800, driverAllowance: 800, fuelBuffer: 900 },
      ],
      mealOptions: [
        { key: 'breakfast', label: 'Breakfast', perPersonCost: 180, defaultIncluded: true },
        { key: 'lunch', label: 'Lunch', perPersonCost: 280, defaultIncluded: false },
        { key: 'dinner', label: 'Dinner', perPersonCost: 320, defaultIncluded: true },
        { key: 'tea', label: 'Tea / snacks', perPersonCost: 90, defaultIncluded: false },
      ],
    });
  }
  return settings;
};

module.exports = mongoose.model('PackageCalculatorSettings', packageCalculatorSettingsSchema);
