const { response } = require("express");

const { ventaItinerante, detalleVentaItinerante, resumenVentaItinerante, liquidacionVendedorDetallado, resumenVentaItineranteDev, informacionVendedor } = require("../services/adc");

const getVentaItinerante = async (req, res = response) => {
    try {
        console.log( req.params);
        const vItinerante = await ventaItinerante( req.params );

        res.json({
            totalRegistros: vItinerante.length,
            vItinerante,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
};

const getDetalleVentaItinerante = async (req, res = response) => {
    try {
        console.log( req.params);
        const vItinerante = await detalleVentaItinerante( req.params );

        res.json({
            totalRegistros: vItinerante.length,
            vItinerante,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
};

const getResumenVentaItinerante = async (req, res = response) => {
    try {
        console.log( req.params);
        const vItinerante = await resumenVentaItinerante( req.params );

        res.json({
            totalRegistros: vItinerante.length,
            vItinerante,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
};

const getLiquidacionVendedorDetallado = async (req, res = response) => {
    try {
        console.log( req.params);
        const liquidacionVendedor = await liquidacionVendedorDetallado( req.params );

        res.json({
            totalRegistros: liquidacionVendedor.length,
            liquidacionVendedor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
};

const getResumenVentaItineranteDev = async (req, res = response) => {
    try {
        console.log( req.params);
        const vItinerante = await resumenVentaItineranteDev( req.params );

        res.json({
            totalRegistros: vItinerante.length,
            vItinerante,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
};

const getInformacionVendedor = async (req, res = response) => {
    try {
        console.log( req.params);
        const infoVendedor = await informacionVendedor( req.params );

        res.json({
            totalRegistros: infoVendedor.length,
            infoVendedor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Por favor hable con el administrador",
        });
    }
}

module.exports = {
    getVentaItinerante,
    getDetalleVentaItinerante,
    getResumenVentaItinerante,
    getLiquidacionVendedorDetallado,
    getResumenVentaItineranteDev,
    getInformacionVendedor,
};
