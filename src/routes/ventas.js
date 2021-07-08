/*
	Rutas para los procesos de contabilidad
	host + /api/ventas
*/
const { Router } = require('express');
const { getVentaItinerante, getDetalleVentaItinerante, getResumenVentaItinerante, getLiquidacionVendedorDetallado,getResumenVentaItineranteDev, getInformacionVendedor } = require('../controllers/ventas');

const router = Router();

router.get('/venta-itinerante/:size/:fecha/:codigo/:placa', getVentaItinerante);
router.get('/detalle-venta-itinerante/:fecha/:codigo/:placa/:productoId', getDetalleVentaItinerante);
router.get('/resumen-venta-itinerante/:fecha/:codigo/:placa', getResumenVentaItinerante);
router.get('/liquidacion-vendedor-detallado/:fecha/:codigo', getLiquidacionVendedorDetallado);
router.get('/resumen-venta-itinerante-dev/:fecha/:codigo/:placa', getResumenVentaItineranteDev);
router.get('/informacion-vendedor/:codigo', getInformacionVendedor);

module.exports = router;
