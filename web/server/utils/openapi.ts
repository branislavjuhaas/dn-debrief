type SchemaType =
  | "array"
  | "boolean"
  | "integer"
  | "null"
  | "number"
  | "object"
  | "string";

export interface SchemaObject {
  type?: SchemaType | SchemaType[];
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: any[];
  oneOf?: SchemaObject[];
  allOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  nullable?: boolean;
  description?: string;
  format?: string;
  example?: any;
  [key: string]: any;
}

// Returning \`any\` bridges your schema to Nitropack's internal OpenAPI 3.1 types
export const defineSchema = (schema: SchemaObject): any => schema;
