const axios = require('axios');
const https = require('https');
const http = require('http');

const axiosSinToken = ( url, data, method = 'GET', headers ) => {

	//const url = `${ baseUrl }/${ endpoint }`;

	return new Promise(function (resolve, reject) {
			if ( method === 'GET' ) {
				
				try {
					const resp = axios( url, {
						method,
						params: data,
					});
					resolve( resp );
				} catch (error) {
					reject(error);
				}
			
			}else{

				try {
					const resp = axios( url, {
						method,
						headers,
						data,
						httpAgent: new http.Agent({ keepAlive: true }),
						httpsAgent: new https.Agent({ keepAlive: true }),
					});
					resolve( resp );
				} catch (error) {
					reject(error);
					console.error( 'PRIMER FILTRO' );
					console.error( error );
				}

			}

	});
	
}

module.exports = {
	axiosSinToken,
}