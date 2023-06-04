const locationIndex = Deno.args.indexOf("--location");
const location = locationIndex >= 0 && Deno.args.length > (locationIndex + 1) ? Deno.args[locationIndex + 1] : "http://localhost";
export const baseURL = location;
export const isLocal = /localhost/.test(location);
