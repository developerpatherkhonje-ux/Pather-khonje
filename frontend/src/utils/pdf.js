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
        
        let logoDataURL = '';
        try { logoDataURL = await loadImageAsBase64('/assets/logo.png'); } catch (e) {
            try { logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png'); } catch (err) {}
        }

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';

        // --- PAGE 1 ---
        const page1 = document.createElement('div');
        page1.style.width = '794px'; // A4 Width at 96 PPI
        page1.style.height = '1122px'; // A4 Height at 96 PPI
        page1.style.backgroundColor = 'white';
        page1.style.boxSizing = 'border-box';
        page1.style.display = 'flex';
        page1.style.flexDirection = 'column';
        page1.style.fontFamily = 'Arial, sans-serif';

        page1.innerHTML = `
            <div style="background-color: #ffffff; padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0B2545;">
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
                    <h2 style="margin: 0; font-size: 24px; color: #3A5F8C; text-transform: uppercase; letter-spacing: 2px;">Hotel Invoice</h2>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px; font-weight: bold;">INV-#${invoice.invoiceNumber || 'N/A'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Date Issued</div>
                    <div style="font-size: 16px; color: #0B2545; font-weight: bold;">${formatDate(invoice.date || new Date())}</div>
                </div>
            </div>

            <div style="padding: 30px 40px; flex: 1; display: flex; flex-direction: column;">
                <div style="margin-bottom: 25px;">
                    <div style="font-size: 12px; font-weight: bold; color: #3A5F8C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Billed To</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f1f5f9; padding: 15px; border-left: 4px solid #3A5F8C; border-radius: 4px; font-size: 14px;">
                        <div><strong style="color: #475569;">Name:</strong> <span style="color: #0B2545; font-weight: bold;">${invoice.customer?.name || 'N/A'}</span></div>
                        <div><strong style="color: #475569;">Phone:</strong> ${invoice.customer?.phone || 'N/A'}</div>
                        <div><strong style="color: #475569;">Email:</strong> ${invoice.customer?.email || 'N/A'}</div>
                        <div><strong style="color: #475569;">Address:</strong> ${invoice.customer?.address || 'N/A'}</div>
                    </div>
                </div>

                ${generateServiceDetails(invoice)}
                
                <div style="margin-top: auto;">
                    ${generatePaymentSummary(invoice)}
                </div>
            </div>

            <div style="padding: 0 40px 40px 40px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="font-size: 12px; color: #94a3b8;">
                    <p style="margin: 0;">Thank you for choosing Pather Khonje.</p>
                    <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} Pather Khonje. All rights reserved.</p>
                </div>
                <div style="text-align: center;">
                    <img src="/assets/stamp.png" onerror="this.style.display='none'" alt="Company Stamp" style="width: 120px; height: 120px; opacity: 0.9;" />
                    <div style="margin-top: -30px; font-size: 12px; color: #0B2545; font-weight: bold; border-top: 1px solid #0B2545; padding-top: 4px; width: 160px; position: relative; z-index: 10;">Authorized Signatory</div>
                </div>
            </div>
        `;

        // --- PAGE 2 ---
        const page2 = document.createElement('div');
        page2.style.width = '794px';
        page2.style.height = '1122px';
        page2.style.backgroundColor = '#f8fafc';
        page2.style.boxSizing = 'border-box';
        page2.style.padding = '60px 40px';
        page2.style.position = 'relative';
        page2.style.fontFamily = 'Arial, sans-serif';

        page2.innerHTML = `
            <div style="border-bottom: 2px solid #C7A14A; padding-bottom: 15px; margin-bottom: 30px;">
                <h2 style="margin: 0; font-size: 24px; color: #0B2545; text-transform: uppercase; letter-spacing: 2px;">Terms & Conditions</h2>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Please read these terms carefully before proceeding with your booking.</p>
            </div>
            
            <div style="font-size: 13px; color: #334155; line-height: 1.8; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                ${hotelTerms.map(term => `<div style="margin-bottom: 12px;">${term}</div>`).join('')}
            </div>

            ${logoDataURL ? `<div style="position: absolute; bottom: 60px; right: 40px; opacity: 0.05;"><img src="${logoDataURL}" style="width: 250px;" /></div>` : ''}
        `;

        wrapper.appendChild(page1);
        wrapper.appendChild(page2);
        document.body.appendChild(wrapper);

        // Render PDF - Size Optimization Applied (JPEG with 0.75 compression)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;

        const canvasOptions = { scale: 1.5, useCORS: true, logging: false };

        const canvas1 = await html2canvas(page1, canvasOptions);
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.8);
        pdf.addImage(imgData1, 'JPEG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');
        
        const canvas2 = await html2canvas(page2, canvasOptions);
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.8);
        pdf.addPage();
        pdf.addImage(imgData2, 'JPEG', 0, 0, imgWidth, pageHeight, undefined, 'FAST');

        const safeFileName = (invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);
        document.body.removeChild(wrapper);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('Failed to generate PDF');
    }
}

const generateServiceDetails = (invoice) => {
    return `
        <div style="margin-bottom: 25px;">
            <div style="font-size: 12px; font-weight: bold; color: #3A5F8C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Booking Overview</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
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
                        <td style="padding: 12px 10px; text-align: center; font-weight: bold;">${invoice.hotelDetails.days || 0}D / ${invoice.hotelDetails.nights || 0}N</td>
                    </tr>
                </tbody>
            </table>

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
                        <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #0B2545; border: 1px solid #e2e8f0;">₹${((invoice.hotelDetails.pricePerNight || 0) * (invoice.hotelDetails.rooms || 0) * (invoice.hotelDetails.nights || 0)).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #3A5F8C; font-size: 12px; display: block; margin-bottom: 4px;">Hotel Address:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.address || 'Not provided'}</div>
                </div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #3A5F8C; font-size: 12px; display: block; margin-bottom: 4px;">Additional Benefits:</strong>
                    <div style="font-size: 12px; color: #475569; line-height: 1.4;">${invoice.hotelDetails.additionalBenefits || 'Not provided'}</div>
                </div>
            </div>
        </div>
    `;
};

const generatePaymentSummary = (invoice) => {
    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total || subtotal;
    const advancePaid = invoice.advancePaid || 0;
    const dueAmount = Math.max(0, total - advancePaid);
    
    return `
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 350px;">
                <div style="font-size: 12px; font-weight: bold; color: #3A5F8C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Financial Summary</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tbody>
                        <tr>
                            <td style="padding: 8px 0; color: #475569;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #e2e8f0;">Discount</td>
                            <td style="padding: 8px 0; text-align: right; color: #dc2626; border-bottom: 1px solid #e2e8f0;">-₹${discount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #0B2545; font-weight: bold; font-size: 16px;">Total Amount</td>
                            <td style="padding: 12px 0; text-align: right; color: #0B2545; font-weight: bold; font-size: 16px;">₹${total.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #16a34a;">Advance Paid</td>
                            <td style="padding: 8px 0; text-align: right; color: #16a34a; font-weight: bold;">₹${advancePaid.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 15px; background: #3A5F8C; color: white; font-weight: bold; border-radius: 4px 0 0 4px; margin-top: 10px; display: inline-block;">DUE BALANCE</td>
                            <td style="padding: 12px 15px; background: #3A5F8C; color: white; font-weight: bold; text-align: right; border-radius: 0 4px 4px 0; margin-top: 10px;">₹${dueAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align: right; margin-top: 10px; font-size: 12px; color: #64748b;">Payment Method: <strong>${invoice.paymentMethod || 'N/A'}</strong></div>
            </div>
        </div>
    `;
};