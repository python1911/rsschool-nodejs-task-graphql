import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export function getRequestedFields(info: GraphQLResolveInfo, fieldName: string): boolean {
  const parsedInfo = parseResolveInfo(info);
  if (!parsedInfo || !parsedInfo.fieldsByTypeName) return false;

  const userFields = parsedInfo.fieldsByTypeName['User'];
  return Boolean(userFields && userFields[fieldName]);
}
