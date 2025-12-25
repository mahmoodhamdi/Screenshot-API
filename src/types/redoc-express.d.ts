/**
 * Type declarations for redoc-express
 */

declare module 'redoc-express' {
  import { RequestHandler } from 'express';

  interface RedocTheme {
    colors?: {
      primary?: { main?: string };
      success?: { main?: string };
      warning?: { main?: string };
      error?: { main?: string };
      text?: { primary?: string; secondary?: string };
      http?: {
        get?: string;
        post?: string;
        put?: string;
        options?: string;
        patch?: string;
        delete?: string;
        head?: string;
      };
    };
    typography?: {
      fontSize?: string;
      fontFamily?: string;
      headings?: { fontFamily?: string };
      code?: { fontSize?: string; fontFamily?: string };
    };
    sidebar?: {
      width?: string;
      backgroundColor?: string;
      textColor?: string;
    };
    rightPanel?: {
      backgroundColor?: string;
    };
    schema?: {
      nestedBackground?: string;
    };
  }

  interface RedocOptions {
    theme?: RedocTheme;
    hideDownloadButton?: boolean;
    hideHostname?: boolean;
    expandResponses?: string;
    jsonSampleExpandLevel?: number | 'all';
    sortPropsAlphabetically?: boolean;
    hideLoading?: boolean;
    nativeScrollbars?: boolean;
    pathInMiddlePanel?: boolean;
    requiredPropsFirst?: boolean;
    scrollYOffset?: number | string;
    showExtensions?: boolean;
    noAutoAuth?: boolean;
  }

  interface RedocConfig {
    title: string;
    specUrl: string;
    redocOptions?: RedocOptions;
  }

  function redoc(config: RedocConfig): RequestHandler;
  export = redoc;
}
