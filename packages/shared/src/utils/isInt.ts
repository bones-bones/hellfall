export const isInteger=(num:string) =>{
  return num == parseInt(num).toString()
}
export const isNumber=(num:string) =>{
  return isInteger(num) || num == parseFloat(num).toString()
}