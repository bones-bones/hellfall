declare module "*.otf" {
  const value: any; // Add better type definitions here if desired.
  export default value;
}
declare module "*.csv" {
  const value: any; // Add better type definitions here if desired.
  export default value;
}
declare module "*.json" {
  const value: { data: any };
  export default value;
}
