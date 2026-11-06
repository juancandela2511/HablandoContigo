/**
 * ============================================================================
 * ESTILOS CSS DE PRESENTACIÓN EJECUTIVA PDF (estilosPresentacionPdf.ts)
 * ============================================================================
 * Define las hojas de estilo de impresión A4 horizontal y diseño de diapositivas.
 */

export const ESTILOS_PRESENTACION_PDF = `
  @page {
    size: A4 landscape;
    margin: 0;
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 24px 10px;
    background-color: #0b1329;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    display: flex;
    flex-direction: column;
    align-items: center;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .diapositiva-slide {
    width: 960px;
    height: 540px;
    max-width: 100%;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    page-break-after: always;
    page-break-inside: avoid;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 36px 46px 28px 46px;
    margin-bottom: 30px;
  }
  .fondo-blanco {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
  }
  .portada-bg {
    background: linear-gradient(135deg, #071938 0%, #0d2757 45%, #13397d 80%, #0a2046 100%);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .portada-empresa {
    font-size: 16px;
    font-weight: 700;
    color: #60a5fa;
    letter-spacing: 0.5px;
    margin-bottom: 24px;
  }
  .portada-titulo-grande {
    font-size: 44px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.12;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .portada-datos { margin-top: 30px; }
  .portada-fecha { font-size: 14px; color: #93c5fd; font-weight: 600; margin-bottom: 8px; }
  .portada-presentador { font-size: 16px; font-weight: 800; color: #ffffff; }
  .portada-cargo { font-size: 13px; color: #cbd5e1; margin-top: 2px; }
  .portada-logo-caja {
    background: #ffffff;
    padding: 8px 16px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .portada-logo-img { max-height: 48px; max-width: 170px; object-fit: contain; }
  .slide-header-pregunta { border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
  .badge-dim { font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .slide-titulo-pregunta { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.35; }
  .slide-cuerpo-pai { flex: 1; display: flex; align-items: center; justify-content: center; }
  .slide-footer-pregunta { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
  .slide-analisis-texto { font-size: 11.5px; color: #334155; margin: 0; line-height: 1.5; max-width: 760px; font-weight: 500; }
  .slide-logo-caja { flex-shrink: 0; }
  .slide-logo-img { max-height: 32px; max-width: 120px; object-fit: contain; }
  .slide-titulo-grande { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
  .linea-decorativa { width: 50px; height: 3px; background: #0284c7; border-radius: 2px; margin: 8px auto 0 auto; }
  .cuerpo-conclusion { display: grid; grid-template-columns: 1fr; align-items: center; gap: 30px; flex: 1; }
  .conclusion-texto-caja { line-height: 1.6; }
  .conclusion-parrafo { font-size: 13px; color: #334155; margin: 0 0 14px 0; font-weight: 500; }
  .firma-evaluador { margin-top: 20px; display: flex; flex-direction: column; font-size: 12px; }
  .firma-linea { width: 140px; height: 1.5px; background: #94a3b8; margin-bottom: 6px; }
  .boton-imprimir-flotante {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0284c7;
    color: #ffffff;
    padding: 14px 28px;
    border-radius: 30px;
    font-weight: 800;
    font-size: 14px;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4);
    z-index: 9999;
  }
  @media print {
    body { background-color: #ffffff; padding: 0; margin: 0; }
    .diapositiva-slide {
      width: 100vw;
      height: 100vh;
      max-width: none;
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      page-break-after: always;
      page-break-inside: avoid;
      padding: 40px 48px;
    }
    .boton-imprimir-flotante { display: none !important; }
  }
`
