// General utility functions

function truncation_render_string(data, type, row) {
   //return type === 'display' && data.length > 10 ? data.substr( 0, 10 ) +'…' : data;
   return data.length > 10 ? data.substr( 0, 10 ) + '...' : data;
}
