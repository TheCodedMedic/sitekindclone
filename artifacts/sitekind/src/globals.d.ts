declare module "*.css";
declare module "*.css?url" {
  const href: string;
  export default href;
}

declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;
