export const qrUtils = {
    generateProductQRValue: (productId: string) => {
        // Generates a URL that can be scanned to view the product
        // Using window.location.origin to point to the current deployment
        return `${window.location.origin}/products/${productId}`;
    },

    downloadQR: (canvasId: string, fileName: string) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = url;
        link.click();
    },

    printQR: (canvasId: string, productName: string) => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const windowPrint = window.open('', '', 'width=600,height=600');

        if (windowPrint) {
            windowPrint.document.write(`
                <html>
                    <head>
                        <title>Imprimir QR - ${productName}</title>
                        <style>
                            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                            img { width: 300px; height: 300px; }
                            h1 { margin-top: 20px; font-size: 24px; }
                            p { color: #666; }
                        </style>
                    </head>
                    <body>
                        <img src="${dataUrl}" />
                        <h1>${productName}</h1>
                        <p>Escanea para ver detalles en StockPro</p>
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        </script>
                    </body>
                </html>
            `);
            windowPrint.document.close();
        }
    }
};
