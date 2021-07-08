const db = require('../database/pg-config');

function ventaItinerante( params ){

    const query = `
    SELECT
        ROW_NUMBER () OVER (ORDER BY t1.guia_producto_codigo) AS id,
        t1.guia_producto_id,
        t1.guia_producto_codigo,
        t1.guia_producto_descripcion,
        t1.guia_producto_cantidad,
        COALESCE(t2.documento_venta_producto_id,0) AS documento_venta_producto_id,
        COALESCE(t2.documento_venta_producto_codigo,'-') AS documento_venta_producto_codigo,
        COALESCE(t2.documento_venta_descripcion_producto,'-') AS documento_venta_descripcion_producto,
        COALESCE(t2.documento_venta_producto_cantidad,0) AS documento_venta_producto_cantidad,
        t1.guia_producto_cantidad - COALESCE(t2.documento_venta_producto_cantidad,0) AS "diferencia",
        '${params.fecha}' as fecha,
        '${params.placa}' as placa,
        '${params.codigo}' as codigo
    FROM (
        SELECT  
            grd.producto_id AS guia_producto_id,
            p.codigo AS guia_producto_codigo,
            grd.descripcion_producto AS guia_producto_descripcion,
            sum(grd.cantidad) AS guia_producto_cantidad
        FROM almacenes.guia_remisiones gr 
        INNER JOIN almacenes.guia_remision_detalles grd ON grd.guia_remisione_id = gr.id
        INNER JOIN maestros.productos p ON p.id = grd.producto_id
        WHERE gr.fecha_emision <= '${params.fecha}'AND gr.fecha_traslado = '${params.fecha}' AND gr.placa_vehiculo='${params.placa}' AND gr.activo AND gr.anulado = FALSE AND gr.descarga AND gr.despachado = FALSE
        GROUP BY grd.producto_id, grd.descripcion_producto,p.codigo) t1
    LEFT JOIN ( 
        SELECT
            dvd.producto_id AS documento_venta_producto_id,
            p.codigo AS documento_venta_producto_codigo,
            dvd.descripcion_producto AS documento_venta_descripcion_producto,
            sum(dvd.cantidad) AS documento_venta_producto_cantidad
        FROM facturacion.documento_ventas dv
        INNER JOIN facturacion.documento_venta_detalles dvd ON dvd.documento_venta_id = dv.id
        INNER JOIN maestros.productos p ON p.id = dvd.producto_id
        INNER JOIN facturacion.vendedores v ON v.id = dv.vendedor_id
        WHERE dv.activo 
            AND dv.anulado = FALSE 
            AND dv.descarga = FALSE 
            AND v.codigo = '${params.codigo}' 
            --AND dv.fecha_emision ='${params.fecha}'
            AND
                CASE 
                    WHEN v.vende_provincias THEN dv.fecha_emision BETWEEN '${params.fecha}' AND '${params.fecha}'::DATE + 1
                    ELSE dv.fecha_emision = '${params.fecha}'
                END 
        GROUP BY dvd.producto_id, dvd.descripcion_producto,p.codigo
        ) t2 ON t1.guia_producto_id = t2.documento_venta_producto_id
    ORDER BY "diferencia" DESC,t1.guia_producto_codigo ASC
    LIMIT 5 OFFSET ${params.size};
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );
            //console.log( rows );
			
		} catch ( error ) {
			reject( error );
			//console.log(error);
		}
	})
}

function detalleVentaItinerante( params ){

    const query=`
    SELECT  
        gr.id,
        109 AS codigo_documento_id,
        gr.numero_documento,
        gr.nombre_cliente,
        grd.cantidad,
        grd.producto_id AS guia_producto_id,
        p.codigo AS guia_producto_codigo,
        grd.descripcion_producto AS guia_prodcuto_descripcion
    FROM almacenes.guia_remisiones gr 
    INNER JOIN almacenes.guia_remision_detalles grd ON grd.guia_remisione_id = gr.id
    INNER JOIN maestros.productos p ON p.id = grd.producto_id
    WHERE gr.fecha_emision <= '${params.fecha}' 
        AND gr.placa_vehiculo='${params.placa}' 
        AND gr.activo 
        AND gr.anulado = FALSE 
        AND gr.descarga 
        AND gr.despachado = FALSE 
        AND gr.numero_documento <> ''
        AND grd.producto_id = ${params.productoId}
	AND gr.fecha_traslado = '${params.fecha}'
    UNION ALL
    SELECT
        dv.id,
        dv.codigo_documento_id,
        dv.numero_documento,
        dv.nombre_cliente,
        dvd.cantidad,
        dvd.producto_id AS documento_venta_producto_id,
        p.codigo AS documento_venta_producto_codigo,
        dvd.descripcion_producto AS documento_venta_descripcion_producto
    FROM facturacion.documento_ventas dv
    INNER JOIN facturacion.documento_venta_detalles dvd ON dvd.documento_venta_id = dv.id
    INNER JOIN maestros.productos p ON p.id = dvd.producto_id
    INNER JOIN facturacion.vendedores v ON v.id = dv.vendedor_id
    WHERE dv.activo AND dv.anulado = FALSE AND dv.descarga = FALSE 
        AND v.codigo = '${params.codigo}' 
        --AND dv.fecha_emision ='${params.fecha}'
        AND
            CASE 
                WHEN v.vende_provincias THEN dv.fecha_emision BETWEEN '${params.fecha}' AND '${params.fecha}'::DATE + 1
                ELSE dv.fecha_emision = '${params.fecha}'
            END  
        AND dvd.producto_id = ${params.productoId}
    ORDER BY codigo_documento_id DESC, numero_documento DESC;
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );
            //console.log( rows );
			
		} catch ( error ) {
			reject( error );
			//console.log(error);
		}
	})
}

function resumenVentaItinerante( params ){

    const query=`
    SELECT
        ROW_NUMBER () OVER (ORDER BY t.id,t.codigo_documento_id) AS id,
        t.id AS documento_id,
        t.nombre_vendedor,
        t.codigo_documento_id,
        t.numero_documento,
        t.descarga,
        t.producto_cantidad,
        t.importe_total
    FROM (
        SELECT  
            gr.id AS id,
            '' as nombre_vendedor,
            109 AS codigo_documento_id,
            gr.numero_documento AS numero_documento,
            gr.descarga,
            sum(grd.cantidad) AS producto_cantidad,
            0 AS importe_total
        FROM almacenes.guia_remisiones gr 
        INNER JOIN almacenes.guia_remision_detalles grd ON grd.guia_remisione_id = gr.id
        WHERE gr.activo
            AND gr.anulado = FALSE
            AND gr.fecha_emision <= '${params.fecha}' 
            AND gr.placa_vehiculo='${params.placa}'  
            AND gr.descarga 
            AND gr.despachado = FALSE
            AND gr.fecha_traslado = '${params.fecha}'
        GROUP BY gr.id,gr.numero_documento
        UNION ALL
        SELECT
            dv.vendedor_id AS id,
            dv.nombre_vendedor,
            100 AS codigo_documento_id,
            'COMPROBANTES' AS numero_documento,
            dv.descarga,
            sum( dvd.cantidad ) AS producto_cantidad,
            sum( COALESCE(dvd.importe_total,0) + COALESCE(dvd.percepcion,0) ) AS importe_total
        FROM facturacion.documento_ventas dv
        INNER JOIN facturacion.documento_venta_detalles dvd ON dvd.documento_venta_id = dv.id
        INNER JOIN facturacion.vendedores v ON v.id = dv.vendedor_id
        WHERE dv.activo 
            AND dv.anulado = FALSE 
            --AND dv.descarga = FALSE
            AND v.codigo = '${params.codigo}'
            AND
                CASE 
                    WHEN v.vende_provincias THEN dv.fecha_emision BETWEEN '${params.fecha}' AND '${params.fecha}'::DATE + 1
                    ELSE dv.fecha_emision = '${params.fecha}'
                END 
            AND 
                CASE 
                    WHEN v.vende_provincias THEN dv.fecha_pago BETWEEN '${params.fecha}' AND '${params.fecha}'::DATE + 1
                    ELSE dv.fecha_emision = dv.fecha_pago
                END
            AND dv.centro_dist_id = 51
        GROUP BY dv.vendedor_id,dv.nombre_vendedor,dv.descarga
    ) t ;
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );
            //console.log( rows );
			
		} catch ( error ) {
			reject( error );
			//console.log(error);
		}
	})
}

function liquidacionVendedorDetallado( params ){
    const query = `
        SELECT
            vendedor__codigo AS vendedor_codigo,
            vendedor__nombre AS vendedor_nombre,
            documento__fecha AS fecha,
            documento__codigo_documento AS codigo_documento,
            documento__nombre_documento AS nombre_documento,
            documento__numero AS numero_documento,
            COALESCE(documento__observacion,'') AS observacion,
            COALESCE(documento__percepcion,0) AS percepcion,
            COALESCE(documento__importe_contado,0) AS importe_contado,
            COALESCE(documento__importe_credito,0) AS importe_credito,
            COALESCE(documento__importe_nota_credito,0) AS importe_nota_credito,
            COALESCE(documento__importe_cobranza,0) AS importe_cobranza,
            COALESCE(documento__importe_total,0) AS importe_total
        FROM facturacion.liquidacion_vendedor_detallado(51,'${params.codigo}', '${params.fecha}', '${params.fecha}');
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );

		} catch ( error ) {
			reject( error );
		}
	})
    
}

function resumenVentaItineranteDev( params ){

    const query=`
    SELECT
        ROW_NUMBER () OVER (ORDER BY t.id,t.codigo_documento_id) AS id,
        t.id AS documento_id,
        t.nombre_vendedor,
        t.codigo_documento_id,
        t.numero_documento,
        t.descarga,
        t.producto_cantidad,
        t.importe_total
    FROM (
        SELECT  
            gr.id AS id,
            '' as nombre_vendedor,
            109 AS codigo_documento_id,
            gr.numero_documento AS numero_documento,
            gr.descarga,
            sum(grd.cantidad) AS producto_cantidad,
            0 AS importe_total
        FROM almacenes.guia_remisiones gr 
        INNER JOIN almacenes.guia_remision_detalles grd ON grd.guia_remisione_id = gr.id
        WHERE gr.activo
            AND gr.anulado = FALSE
            AND gr.fecha_emision <= '${params.fecha}' 
            AND gr.placa_vehiculo='${params.placa}'  
            AND gr.descarga 
            AND gr.despachado = FALSE
            AND gr.fecha_traslado = '${params.fecha}'
        GROUP BY gr.id,gr.numero_documento
        UNION ALL
        SELECT
            dv.vendedor_id AS id,
            dv.nombre_vendedor,
            100 AS codigo_documento_id,
            'COMPROBANTES' AS numero_documento,
            dv.descarga,
            sum( dvd.cantidad ) AS producto_cantidad,
            sum( COALESCE(dvd.importe_total,0) + COALESCE(dvd.percepcion,0) ) AS importe_total
        FROM facturacion.documento_ventas dv
        INNER JOIN facturacion.documento_venta_detalles dvd ON dvd.documento_venta_id = dv.id
        INNER JOIN facturacion.vendedores v ON v.id = dv.vendedor_id
        WHERE dv.activo 
            AND dv.anulado = FALSE 
            --AND dv.descarga = FALSE
            AND v.codigo = '${params.codigo}'
            AND dv.fecha_emision ='${params.fecha}'
            AND dv.fecha_emision = dv.fecha_pago
            AND dv.centro_dist_id = 51
        GROUP BY dv.vendedor_id,dv.nombre_vendedor,dv.descarga
    ) t ;
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );
            //console.log( rows );
			
		} catch ( error ) {
			reject( error );
			//console.log(error);
		}
	})
}

function informacionVendedor( params ){

    const query=`
    SELECT
        v.id,
        v.codigo,
        v.clave,
        v.vende_provincias
    FROM facturacion.vendedores v 
    WHERE 
        v.activo
        AND deposito_id = 51   
        AND v.empresa_id = 1
        AND v.codigo = '${params.codigo}';
    `;

    return new Promise(async function(resolve, reject) {
		try {

			const { rows } = await db.query(query);
			resolve( rows );
            //console.log( rows );
			
		} catch ( error ) {
			reject( error );
			//console.log(error);
		}
	})
}

module.exports = {
    ventaItinerante,
    detalleVentaItinerante,
    resumenVentaItinerante,
    liquidacionVendedorDetallado,
    resumenVentaItineranteDev,
    informacionVendedor,
}
