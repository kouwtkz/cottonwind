import getParsedData from "../script/getParsedData.ts";
import date_format from "../script/date_format.ts"
const scripts = await getParsedData("_scripts");

export default { ...scripts , date_format };