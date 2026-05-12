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

const hotelTerms = [
    '1. Check-in and check-out timings are as per the respective hotel\'s policy.',
    '2. Any damage to hotel property will be charged to the guest.',
    '3. Smoking is strictly prohibited inside the rooms.',
    '4. Outside food and alcoholic beverages are not allowed.',
    '5. Booking cancellation must be informed at least 48 hours in advance; refund will be as per company policy.',
    '6. Government-approved photo ID is mandatory at the time of check-in.',
    '7. Extra beds and room upgrades are subject to availability and additional charges.',
    '8. Early check-in or late check-out requests are subject to availability and may incur extra charges.',
    '9. Pets are not allowed unless specified by the hotel.',
    '10. The company is not responsible for any loss of personal belongings.'
];

export async function generateInvoicePdf(invoice, fileName = 'invoice') {
    try {
        if (!invoice.hotelDetails?.additionalBenefits) {
            invoice.hotelDetails = { ...invoice.hotelDetails, additionalBenefits: '' };
        }
        
        // Pre-load images to guarantee they show up
        let logoDataURL = '';
        let stampDataURL = '';
        try { logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png'); } catch (e) {}
        try { stampDataURL = await loadImageAsBase64('/assets/stamp.png'); } catch (e) {}

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';

        // Reusable Header Component
        const headerHTML = `
            <div style="background-color: #ffffff; padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3A5F8C;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    ${logoDataURL ? `<img src="${logoDataURL}" style="width: 120px; height: auto; object-fit: contain;" />` : ''}
                    <div>
                        <h1 style="margin: 0; font-size: 32px; color: #0B2545; font-family: Georgia, serif; letter-spacing: 1px;">${companyInfo.name}</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic; color: #64748b;">${companyInfo.tagline}</p>
                    </div>
                </div>
                <div style="text-align: right; font-size: 12px; color: #475569; line-height: 1.5;">
                    <div style="color: #0B2545; font-weight: bold; font-size: 14px; margin-bottom: 4px;">Corporate Office</div>
                    <div>${companyInfo.address.replace(/\n/g, '<br>')}</div>
                    <div>${companyInfo.phone} | ${companyInfo.email}</div>
                    <div style="color: #0284c7;">${companyInfo.website}</div>
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 24px; color: #0ea5e9; text-transform: uppercase; letter-spacing: 2px;">Hotel Invoice</h2>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-weight: bold;">INV-#${invoice.invoiceNumber || 'N/A'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Date Issued</div>
                    <div style="font-size: 16px; color: #0B2545; font-weight: bold;">${formatDate(invoice.date || new Date())}</div>
                </div>
            </div>
        `;

        // --- PAGE 1: HOTEL DETAILS ---
        const page1 = document.createElement('div');
        page1.style.width = '794px';
        page1.style.height = '1122px';
        page1.style.backgroundColor = 'white';
        page1.style.boxSizing = 'border-box';
        page1.style.display = 'flex';
        page1.style.flexDirection = 'column';
        page1.style.fontFamily = 'Arial, sans-serif';

        page1.innerHTML = `
            ${headerHTML}
            <div style="padding: 30px 40px; flex: 1; display: flex; flex-direction: column;">
                <div style="margin-bottom: 25px;">
                    <div style="font-size: 12px; font-weight: bold; color: #0ea5e9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Billed To</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px; font-size: 14px;">
                        <div><strong style="color: #475569;">Name:</strong> <span style="color: #0B2545; font-weight: bold;">${invoice.customer?.name || 'N/A'}</span></div>
                        <div><strong style="color: #475569;">Phone:</strong> ${invoice.customer?.phone || 'N/A'}</div>
                        <div><strong style="color: #475569;">Email:</strong> ${invoice.customer?.email || 'N/A'}</div>
                        <div><strong style="color: #475569;">Address:</strong> ${invoice.customer?.address || 'N/A'}</div>
                    </div>
                </div>

                ${generateServiceDetails(invoice)}
                
                <div style="margin-top: auto; padding-top: 20px; text-align: right; font-size: 12px; color: #94a3b8; font-style: italic; border-top: 1px solid #e2e8f0;">
                    Financial Summary & Signatures continued on Page 2...
                </div>
            </div>
        `;

        // --- PAGE 2: FINANCIAL SUMMARY & TERMS ---
        const page2 = document.createElement('div');
        page2.style.width = '794px';
        page2.style.height = '1122px';
        page2.style.backgroundColor = 'white';
        page2.style.boxSizing = 'border-box';
        page2.style.display = 'flex';
        page2.style.flexDirection = 'column';
        page2.style.fontFamily = 'Arial, sans-serif';

        page2.innerHTML = `
            ${headerHTML}
            <div style="padding: 40px; flex: 1; display: flex; flex-direction: column;">
                
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <div style="background: #0ea5e9; color: white; padding: 12px 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">
                        Financial Summary
                    </div>
                    <div style="display: flex; background: white;">
                        
                        <div style="width: 40%; padding: 25px 20px; border-right: 1px solid #e2e8f0; background: #f8fafc;">
                            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Payment Method</div>
                            <div style="font-size: 18px; color: #0B2545; font-weight: bold;">${invoice.paymentMethod || 'Online / Bank Transfer'}</div>
                            
                            <div style="margin-top: 25px; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                                All payments are securely processed. Please retain this official invoice for your records.
                            </div>
                        </div>
                        
                        <div style="width: 60%; padding: 20px 25px;">
                            ${generatePaymentCalculations(invoice)}
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-bottom: 50px; padding-right: 20px;">
                    <div style="text-align: center; width: 200px;">
                        ${stampDataURL 
                            ? `<img src="${stampDataURL}" alt="Company Stamp" style="width: 140px; height: auto; opacity: 0.9; margin-bottom: 5px;" />` 
                            : `<div style="height: 100px;"></div>`
                        }
                        <div style="font-size: 13px; color: #0B2545; font-weight: bold; border-top: 2px solid #0B2545; padding-top: 8px;">Authorized Signatory</div>
                    </div>
                </div>

                <div style="margin-top: auto; border-top: 2px solid #C7A14A; padding-top: 20px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #0B2545; text-transform: uppercase; letter-spacing: 1px;">Terms & Conditions</h2>
                    <div style="font-size: 12px; color: #475569; line-height: 1.6; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        ${hotelTerms.map(term => `<div style="margin-bottom: 8px;">${term}</div>`).join('')}
                    </div>
                </div>
            </div>
            ${logoDataURL ? `<div style="position: absolute; bottom: 80px; right: 40px; opacity: 0.03; pointer-events: none;"><img src="${logoDataURL}" style="width: 300px;" /></div>` : ''}
        `;

        wrapper.appendChild(page1);
        wrapper.appendChild(page2);
        document.body.appendChild(wrapper);

        // Render PDF explicitly into two pages (JPEG 80% compression to keep size tiny)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;

        const canvasOptions = { scale: 1.5, useCORS: true, logging: false };

        const canvas1 = await html2canvas(page1, canvasOptions);
        pdf.addImage(canvas1.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');
        
        const canvas2 = await html2canvas(page2, canvasOptions);
        pdf.addPage();
        pdf.addImage(canvas2.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');

        const safeFileName = (invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);
        document.body.removeChild(wrapper);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}

const generateServiceDetails = (invoice) => {
    // Advanced Days/Nights Auto-Calculator to fix the "0D" issue
    let days = parseInt(invoice.hotelDetails.days) || 0;
    let nights = parseInt(invoice.hotelDetails.nights) || 0;

    // If nights is 0, calculate it based on dates
    if (nights === 0 && invoice.hotelDetails.checkIn && invoice.hotelDetails.checkOut) {
        const start = new Date(invoice.hotelDetails.checkIn);
        const end = new Date(invoice.hotelDetails.checkOut);
        if (!isNaN(start) && !isNaN(end)) {
            nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        }
    }
    // Days are always Nights + 1 for hotel bookings
    if (days === 0 && nights > 0) {
        days = nights + 1;
    }
    
    // Fallback format
    const formatStr = days > 0 ? `${days}D / ${nights}N` : `${nights}N`;

    return `
        <div style="margin-bottom: 25px;">
            <div style="font-size: 12px; font-weight: bold; color: #0ea5e9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Booking Overview</div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px;">
                <thead>
                    <tr style="background: #3A5F8C; color: white;">
                        <th style="padding: 10px; text-align: left;">Hotel Name</th>
                        <th style="padding: 10px; text-align: left;">Place</th>
                        <th style="padding: 10px; text-align: center;">Check-In</th>
                        <th style="padding: 10px; text-align: center;">Check-Out</th>
                        <th style="padding: 10px; text-align: center;">Days/Nights</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0; background: white;">
                        <td style="padding: 12px 10px; font-weight: bold; color: #0B2545;">${invoice.hotelDetails.hotelName || 'N/A'}</td>
                        <td style="padding: 12px 10px;">${invoice.hotelDetails.place || invoice.hotelDetails.location || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center;">${formatDate(invoice.hotelDetails.checkIn) || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center;">${formatDate(invoice.hotelDetails.checkOut) || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center; font-weight: bold;">${formatStr}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-bottom: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #3A5F8C; font-size: 12px; display: block; margin-bottom: 4px;">Hotel Address:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.address || 'Not provided'}</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #3A5F8C; font-size: 12px; display: block; margin-bottom: 4px;">Additional Benefits:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.additionalBenefits || 'Not provided'}</div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f1f5f9; color: #475569;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Room Type</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">Rooms</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Price/Night</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #e2e8f0;">Pax (A/C)</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: white;">
                        <td style="padding: 12px 10px; border: 1px solid #e2e8f0;">${invoice.hotelDetails.roomType || 'N/A'}</td>
                        <td style="padding: 12px 10px; text-align: center; border: 1px solid #e2e8f0;">${invoice.hotelDetails.rooms || 0}</td>
                        <td style="padding: 12px 10px; text-align: right; border: 1px solid #e2e8f0;">₹${(invoice.hotelDetails.pricePerNight || 0).toLocaleString()}</td>
                        <td style="padding: 12px 10px; text-align: center; border: 1px solid #e2e8f0;">${invoice.hotelDetails.adults || 0}A / ${invoice.hotelDetails.children || 0}C</td>
                        <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #0B2545; border: 1px solid #e2e8f0;">₹${((invoice.hotelDetails.pricePerNight || 0) * (invoice.hotelDetails.rooms || 0) * (nights > 0 ? nights : 1)).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
};

// Extracted calculations to inject into Page 2 (with Dark Blue removed!)
const generatePaymentCalculations = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
                <tr>
                    <td style="padding: 6px 0; color: #475569;">Subtotal</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">Discount</td>
                    <td style="padding: 6px 0; text-align: right; color: #dc2626; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">-₹${discount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #0B2545; font-weight: bold; font-size: 16px;">Total Amount</td>
                    <td style="padding: 12px 0; text-align: right; color: #0B2545; font-weight: bold; font-size: 16px;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #16a34a;">Advance Paid</td>
                    <td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: bold;">₹${advancePaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0 0 0;">
                        <div style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-weight: bold; padding: 10px 15px; border-radius: 4px; display: inline-block; font-size: 13px;">DUE BALANCE</div>
                    </td>
                    <td style="padding: 15px 0 0 0; text-align: right;">
                        <div style="color: #16a34a; font-weight: bold; font-size: 20px;">₹${dueAmount.toLocaleString('en-IN')}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
};