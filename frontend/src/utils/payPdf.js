import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to load image as base64
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
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
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

const paymentTerms = [
    '1. Payment voucher is valid only for the specified amount and purpose.',
    '2. This voucher must be presented at the time of service delivery.',
    '3. No refund will be provided for unused voucher amount.',
    '4. Voucher is non-transferable and non-refundable.',
    '5. Company reserves the right to modify terms and conditions.',
    '6. Any disputes will be subject to Kolkata jurisdiction.',
    '7. Voucher expiry date must be checked before use.',
    '8. Original voucher must be presented for verification.',
    '9. Duplicate vouchers will not be entertained.',
    '10. The company is not responsible for any loss of personal belongings.'
];

// Helper functions for labels
const getCategoryLabel = (category) => {
    const labels = {
        hotel: 'Hotel',
        tour: 'Tour',
        transport: 'Transport',
        food: 'Food',
        other: 'Other'
    };
    return labels[category] || category;
};

const getPaymentMethodLabel = (method) => {
    const labels = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        netbanking: 'Net Banking',
        cheque: 'Cheque'
    };
    return labels[method] || method;
};

export async function generatePaymentVoucherPdf(voucher, fileName = 'payment_voucher') {
    try {
        console.log('Payment Voucher PDF - Voucher data:', voucher);
        console.log('Payment Voucher PDF - Company Info:', companyInfo);
        
        // Create a temporary container for the voucher
        const voucherContainer = document.createElement('div');
        voucherContainer.style.position = 'absolute';
        voucherContainer.style.left = '-9999px';
        voucherContainer.style.width = '794px'; // A4 width at 96 DPI
        voucherContainer.style.backgroundColor = 'white';
        voucherContainer.style.padding = '40px';
        voucherContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Try to load logo
        let logoDataURL = '';
        try {
            logoDataURL = await loadImageAsBase64('/logo/Pather Khonje Logo.png');
        } catch (logoError) {
            console.warn('Logo could not be loaded:', logoError);
        }
        
        voucherContainer.innerHTML = `
            <div style="position: relative; min-height: 1000px;">
                <!-- Watermark -->
                ${logoDataURL ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.05; z-index: 0;">
                    <img src="${logoDataURL}" style="width: 300px; height: 300px;" alt="Watermark" />
                </div>` : ''}
                
                <!-- Content -->
                <div style="position: relative; z-index: 1;">
                    <!-- Header -->
                    <div style="display: flex; align-items: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px;">
                        ${logoDataURL ? `<div style="margin-right: 20px;">
                            <img src="${logoDataURL}" style="width: 100px; height: 100px;" alt="Company Logo" />
                        </div>` : ''}
                        <div style="flex: 1;">
                            <h1 style="color: #16a34a; font-size: 36px; margin: 0; font-weight: bold;">${companyInfo.name}</h1>
                            <p style="color: #666; font-size: 16px; margin: 5px 0; font-style: italic;">${companyInfo.tagline}</p>
                            <div style="margin-top: 10px; font-size: 12px; color: #666; line-height: 1.4;">
                                <div>${companyInfo.address.replace(/\n/g, '<br>')}</div>
                                <div style="margin-top: 8px;">
                                    Email: ${companyInfo.email} | Website: ${companyInfo.website} | Phone: ${companyInfo.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Voucher Info -->
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <h2 style="color: #16a34a; font-size: 24px; margin: 0;">Payment Voucher</h2>
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Voucher #${voucher.voucherNumber || 'N/A'}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 5px 0; font-size: 14px; color: #666;">Date: ${voucher.date ? new Date(voucher.date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <!-- Payee Information -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Payee Information</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div><strong>Payee Name :</strong> ${voucher.payeeName || 'N/A'}</div>
                            <div><strong>Contact :</strong> ${voucher.contact || 'N/A'}</div>
                            <div><strong>Tour Code :</strong> ${voucher.tourCode || 'N/A'}</div>
                            <div><strong>Payment Method :</strong> ${getPaymentMethodLabel(voucher.paymentMethod)}</div>
                            <div style="grid-column: 1 / -1;"><strong>Address :</strong> ${voucher.address || 'N/A'}</div>
                        </div>
                    </div>

                    ${generateExpenseDetails(voucher)}

                    <!-- Payment Summary -->
                    <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Payment Summary</h3>
                        ${generatePaymentSummary(voucher)}
                    </div>

                    <!-- Terms and Conditions -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">Terms and Conditions:</h3>
                        <div style="font-size: 12px; color: #666; line-height: 1.5;">
                            ${paymentTerms.map(term => `<div style="margin-bottom: 5px;">${term}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 2px solid #bbf7d0; padding-top: 20px; margin-top: 40px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div style="text-align: left; padding-top: 20px;">
                                <div style="font-size: 12px; color: #666;">
                                    © 2018 - 2025 Pather Khonje. All rights reserved.
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="text-align: center;">
                                    <img src="/assets/stamp.png" alt="Company Stamp" style="width: 150px; height: 150px;" />
                                    <div style="margin-top: -50px;font-size: 12px; color: #666;">Authorized Signature & Stamp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(voucherContainer);

        // Generate PDF
        const canvas = await html2canvas(voucherContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const safeFileName = (voucher.voucherNumber || 'payment-voucher').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${safeFileName}.pdf`);

        // Clean up
        document.body.removeChild(voucherContainer);
    } catch (error) {
        console.error('Payment Voucher PDF generation error:', error);
        throw new Error('Failed to generate PDF: ' + error.message);
    }
}

const generateExpenseDetails = (voucher) => {
    return `
        <!-- Expense Details -->
        <div style="background: linear-gradient(to right, #f0fdf4, #f0f9ff); padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
            <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Expense Details</h3>
            
            <!-- Expense Information Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <thead>
                    <tr style="background: #dcfce7;">
                        <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Category</th>
                        <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Description</th>
                        <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #86efac; padding: 8px;">${getCategoryLabel(voucher.category)}</td>
                        <td style="border: 1px solid #86efac; padding: 8px;">${voucher.description || 'N/A'}</td>
                        <td style="border: 1px solid #86efac; padding: 8px; font-weight: bold;">₹${(voucher.total || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    ${voucher.category === 'other' && voucher.expenseOther ? `
                        <tr>
                            <td style="border: 1px solid #86efac; padding: 8px;">Other</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">${voucher.expenseOther}</td>
                            <td style="border: 1px solid #86efac; padding: 8px;">-</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
};

const generatePaymentSummary = (voucher) => {
    const total = voucher.total || 0;
    const advance = voucher.advance || 0;
    const due = voucher.due || (total - advance);
    
    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background: #dcfce7;">
                    <th style="border: 1px solid #86efac; padding: 8px; text-align: left; color: #166534;">Description</th>
                    <th style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #166534;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Total Amount</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Advance Payment</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right; color: #16a34a;">₹${advance.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: ${due < 0 ? '#fef3c7' : '#f0fdf4'}; font-weight: bold;">
                    <td style="border: 1px solid #86efac; padding: 8px;">Amount Due</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right; color: ${due < 0 ? '#ea580c' : '#166534'};">₹${due.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #86efac; padding: 8px;">Payment Method</td>
                    <td style="border: 1px solid #86efac; padding: 8px; text-align: right;">${getPaymentMethodLabel(voucher.paymentMethod)}</td>
                </tr>
            </tbody>
        </table>
    `;
};
