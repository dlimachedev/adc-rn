
function llenarCeros( num, size ) {
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}

function tokenExpired( token ){
	let currentTimestamp = Date.now()/1000;
	let timestampToExpireToken = token.expiresAt - currentTimestamp;
	const expired = timestampToExpireToken<=300? true : false; 
	return expired;
}

module.exports = {
	llenarCeros,
	tokenExpired,
}