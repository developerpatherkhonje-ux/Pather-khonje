import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './dateUtils';

const loadImageAsBase64 = (imagePath) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imagePath;
    });
};

const companyInfo = {
    name: 'Pather Khonje',
    tagline: 'A tour that never seen before.',
    address: '64/2/12, Biren Roy Road (East),\nBehala Chowrasta, Kolkata - 700008',
    email: 'contact@patherkhonje.com',
    website: 'www.patherkhonje.com',
    phone: '+91 7439857694'
};

const tourTerms = [
    '1. Tour itinerary may change due to weather conditions or unforeseen circumstances.',
    '2. All passengers must carry valid ID proof during travel.',
    '3. Package cost includes mentioned services only.',
    '4. Cancellation charges as per company policy will apply.',
    '5. Company is not responsible for any loss of personal belongings.'
];

export async function generateTourInvoicePdf(invoice, fileName = 'tour_invoice') {
    try {
        const invoiceContainer = document.createElement('div');
        invoiceContainer.style.position = 'absolute';
        invoiceContainer.style.left = '-9999px';
        invoiceContainer.style.width = '794px'; // Exact A4 width
        invoiceContainer.style.backgroundColor = 'white';
        invoiceContainer.style.fontFamily = 'Arial, sans-serif';
        
        let logoDataURL = '';
        try { logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png'); } catch (e) {}
        
        invoiceContainer.innerHTML = `
            <!-- PAGE 1: INVOICE DETAILS -->
            <div style="height: 1122px; position: relative; box-sizing: border-box; display: flex; flex-direction: column;">
                
                <!-- Premium Header -->
                <div style="background-color: #0f172a; color: white; padding: 40px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        ${logoDataURL ? `<div style="background: white; padding: 10px; border-radius: 8px;"><img src="${logoDataURL}" style="width: 80px; height: 80px; object-fit: contain;" /></div>` : ''}
                        <div>
                            <h1 style="margin: 0; font-size: 32px; color: #d4af37; font-family: Georgia, serif; letter-spacing: 1px;">${companyInfo.name}</h1>
                            <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic; color: #cbd5e1;">${companyInfo.tagline}</p>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        <div style="color: white; font-weight: bold; font-size: 14px; margin-bottom: 4px;">Corporate Office</div>
                        <div>${companyInfo.address.replace(/\n/g, '<br>')}</div>
                        <div>${companyInfo.phone} | ${companyInfo.email}</div>
                        <div style="color: #d4af37;">${companyInfo.website}</div>
                    </div>
                </div>

                <!-- Invoice Meta Bar -->
                <div style="background-color: #f8fafc; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-size: 24px; color: #16a34a; text-transform: uppercase; letter-spacing: 2px;">Tour Invoice</h2>
                        <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-weight: bold;">INV-#${invoice.invoiceNumber || 'N/A'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Date Issued</div>
                        <div style="font-size: 16px; color: #0f172a; font-weight: bold;">${formatDate(invoice.date || new Date())}</div>
                    </div>
                </div>

                <div style="padding: 20px 40px; flex: 1;">
                    <!-- Bill To -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 12px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Billed To</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; border-radius: 4px; font-size: 14px;">
                            <div><strong style="color: #475569;">Name:</strong> <span style="color: #0f172a; font-weight: bold;">${invoice.customer?.name || 'N/A'}</span></div>
                            <div><strong style="color: #475569;">Phone:</strong> ${invoice.customer?.phone || 'N/A'}</div>
                            <div><strong style="color: #475569;">Email:</strong> ${invoice.customer?.email || 'N/A'}</div>
                            <div><strong style="color: #475569;">Address:</strong> ${invoice.customer?.address || 'N/A'}</div>
                        </div>
                    </div>

                    ${generateTourPackageDetails(invoice)}
                    ${generateHotelDetails(invoice)}
                    ${generateTransportDetails(invoice)}

                    ${generateTourPaymentSummary(invoice)}
                </div>

                <!-- Footer / Signatures -->
                <div style="padding: 0 40px 30px 40px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="font-size: 12px; color: #94a3b8;">
                        <p style="margin: 0;">Thank you for choosing Pather Khonje.</p>
                        <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} Pather Khonje. All rights reserved.</p>
                    </div>
                    <div style="text-align: center;">
                        <img src="/assets/stamp.png" alt="Company Stamp" style="width: 120px; height: 120px; opacity: 0.9;" />
                        <div style="margin-top: -30px; font-size: 12px; color: #0f172a; font-weight: bold; border-top: 1px solid #0f172a; padding-top: 4px; width: 160px;">Authorized Signatory</div>
                    </div>
                </div>
            </div>

            <!-- PAGE 2: TERMS AND CONDITIONS -->
            <div style="height: 1122px; position: relative; box-sizing: border-box; background: #f8fafc; padding: 60px 40px;">
                <div style="border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; color: #0f172a; text-transform: uppercase; letter-spacing: 2px;">Terms & Conditions</h2>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Please read these terms carefully before proceeding with your booking.</p>
                </div>
                
                <div style="font-size: 13px; color: #334155; line-height: 1.8; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    ${tourTerms.map(term => `<div style="margin-bottom: 12px;">${term}</div>`).join('')}
                </div>

                ${logoDataURL ? `<div style="position: absolute; bottom: 60px; right: 40px; opacity: 0.1;"><img src="${logoDataURL}" style="width: 200px;" /></div>` : ''}
            </div>
        `;

        document.body.appendChild(invoiceContainer);

        const canvas = await html2canvas(invoiceContainer, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 297;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight * 2);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -pageHeight, imgWidth, pageHeight * 2);

        const safeFileName = (invoice.invoiceNumber || 'tour_invoice').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);
        document.body.removeChild(invoiceContainer);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}

const generateTourPackageDetails = (invoice) => {
    if (!invoice.tourDetails) return '';
    return `
        <div style="margin-bottom: 15px;">
            <div style="font-size: 12px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Tour Overview</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #0f172a; color: white;">
                        <th style="padding: 8px; text-align: left;">Package Name</th>
                        <th style="padding: 8px; text-align: center;">Start Date</th>
                        <th style="padding: 8px; text-align: center;">End Date</th>
                        <th style="padding: 8px; text-align: center;">Days</th>
                        <th style="padding: 8px; text-align: center;">Pax</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: white; border: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold;">${invoice.tourDetails.packageName || 'N/A'}</td>
                        <td style="padding: 10px; text-align: center;">${formatDate(invoice.tourDetails.startDate) || 'N/A'}</td>
                        <td style="padding: 10px; text-align: center;">${formatDate(invoice.tourDetails.endDate) || 'N/A'}</td>
                        <td style="padding: 10px; text-align: center;">${invoice.tourDetails.totalDays || invoice.tourDetails.days || 0}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold;">${invoice.tourDetails.pax || 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
            
            ${(invoice.tourDetails.inclusions || invoice.tourDetails.exclusions) ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    ${invoice.tourDetails.inclusions ? `
                        <div style="background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <strong style="color: #16a34a; font-size: 12px;">Inclusions:</strong>
                            <div style="font-size: 11px; color: #475569; margin-top: 4px;">${invoice.tourDetails.inclusions.split('\n').map(i => `<div>• ${i.trim()}</div>`).join('')}</div>
                        </div>
                    ` : '<div></div>'}
                    ${invoice.tourDetails.exclusions ? `
                        <div style="background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
                            <strong style="color: #dc2626; font-size: 12px;">Exclusions:</strong>
                            <div style="font-size: 11px; color: #475569; margin-top: 4px;">${invoice.tourDetails.exclusions.split('\n').map(i => `<div>• ${i.trim()}</div>`).join('')}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
};

const generateHotelDetails = (invoice) => {
    const hotels = Array.isArray(invoice.hotels) ? invoice.hotels : Array.isArray(invoice.tourDetails?.hotels) ? invoice.tourDetails.hotels : [];
    if (hotels.length === 0) return '';

    return `
        <div style="margin-bottom: 15px;">
            <div style="font-size: 12px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Accommodation</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f1f5f9; color: #475569;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Hotel Name</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Place</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">Check-in</th>
                        <th style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">Check-out</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Room Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${hotels.map(hotel => `
                        <tr style="background: white;">
                            <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${hotel.hotelName || hotel.name || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${hotel.place || 'N/A'}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${formatDate(hotel.checkIn) || 'N/A'}</td>
                            <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${formatDate(hotel.checkOut) || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #e2e8f0;">${hotel.roomType || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const generateTransportDetails = (invoice) => {
    if (!invoice.transportDetails) return '';
    
    const includedDetails = invoice.transportDetails?.includedTransportDetails || invoice.tourDetails?.includedTransportDetails || '';
    
    return `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Logistics</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f1f5f9; color: #475569;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Transport Mode</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Fooding</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Pickup</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Drop</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: white;">
                        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${invoice.transportDetails?.modeOfTransport || invoice.tourDetails?.modeOfTransport || invoice.tourDetails?.transport || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${invoice.transportDetails?.fooding || invoice.tourDetails?.fooding || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${invoice.transportDetails?.pickupPoint || invoice.tourDetails?.pickupPoint || invoice.tourDetails?.pickup || 'N/A'}</td>
                        <td style="padding: 8px; border: 1px solid #e2e8f0;">${invoice.transportDetails?.dropPoint || invoice.tourDetails?.dropPoint || invoice.tourDetails?.drop || 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
            
            ${includedDetails && includedDetails.trim() !== '' ? `
                <div style="background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; border-top: none; margin-top: -1px;">
                    <strong style="color: #16a34a; font-size: 11px; text-transform: uppercase;">Included Transport Details:</strong>
                    <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5;">${includedDetails}</div>
                </div>
            ` : ''}
        </div>
    `;
};

const generateTourPaymentSummary = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const gstAmount = invoice.tax || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    let adultPrice = Number(invoice.tourDetails?.adultPrice || 0);
    let childPrice = Number(invoice.tourDetails?.childPrice || 0);
    let adults = Number(invoice.tourDetails?.adults || 0);
    let children = Number(invoice.tourDetails?.children || 0);
    
    if ((adultPrice === 0 && childPrice === 0) && subtotal > 0) {
        adults = 1; children = 0; adultPrice = subtotal; childPrice = 0;
    }
    
    const adultTotal = adultPrice * adults;
    const childTotal = childPrice * children;
    
    return `
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 350px;">
                <div style="font-size: 12px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Financial Summary</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tbody>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;">Adults (${adults} × ₹${adultPrice.toLocaleString('en-IN')})</td>
                            <td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${adultTotal.toLocaleString('en-IN')}</td>
                        </tr>
                        ${children > 0 ? `
                        <tr>
                            <td style="padding: 6px 0; color: #475569;">Children (${children} × ₹${childPrice.toLocaleString('en-IN')})</td>
                            <td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${childTotal.toLocaleString('en-IN')}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 6px 0; color: #475569; border-top: 1px dashed #e2e8f0; margin-top: 4px;">Subtotal</td>
                            <td style="padding: 6px 0; text-align: right; border-top: 1px dashed #e2e8f0; margin-top: 4px;">₹${subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569;">GST (${invoice.gstPercent || 0}%)</td>
                            <td style="padding: 6px 0; text-align: right;">₹${gstAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #475569; border-bottom: 1px solid #e2e8f0;">Discount</td>
                            <td style="padding: 6px 0; text-align: right; color: #dc2626; border-bottom: 1px solid #e2e8f0;">-₹${discount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 15px;">Total Amount</td>
                            <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: bold; font-size: 15px;">₹${total.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #16a34a;">Advance Paid</td>
                            <td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: bold;">₹${advancePaid.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 15px; background: #0f172a; color: white; font-weight: bold; border-radius: 4px 0 0 4px; margin-top: 8px; display: inline-block;">DUE BALANCE</td>
                            <td style="padding: 12px 15px; background: #0f172a; color: #d4af37; font-weight: bold; text-align: right; border-radius: 0 4px 4px 0; margin-top: 8px;">₹${dueAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align: right; margin-top: 10px; font-size: 11px; color: #64748b;">Payment Method: <strong>${invoice.paymentMethod || 'Cash'}</strong></div>
            </div>
        </div>
    `;
};