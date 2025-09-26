import { ApiFilterParam, ApiSortParam, QueryDto } from "@Application/dtos/request/query.dto";
import { UserResponseDto } from "@Application/dtos/response/user.dto";
import { ComparisonOperator, OperatorSchema } from "@Domain/core/query";
import { Request } from "express";

export default class BaseApiController {
  /**
   * Get the current user from the request object.
   * @param {Request<T>} req The request object.
   * @return {UserResponseDto} The current user.
   * @throws {Error} If no user is found in the request.
   */
  getCurrentUser = <T>(req: Request<T>): UserResponseDto => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.user;
    if (!user) throw new Error("No user logged user found");
    return user;
  };

  parseFilterString = (req: Request): ApiFilterParam[] => {
    const filters: ApiFilterParam[] = [];
    // Filter formart: filter=field:operator:value&filter=field:operator:value
    const filterStrings = req.query.filter;
    const allowedOperators = new Set(OperatorSchema);
    if (filterStrings) {
      const filterArray = Array.isArray(filterStrings) ? filterStrings : [filterStrings];
      for (const filterStr of filterArray) {
        if (typeof filterStr !== "string") continue;

        const [field, operator, value] = filterStr.split(":");
        if (field && operator && value) continue;
        if (!allowedOperators.has(operator as ComparisonOperator)) continue;

        filters.push({ field, operator, value, raw: filterStr.toString() });
      }
    }

    return filters;
  };

  parseSortString = (req: Request): ApiSortParam[] => {
    const sortParams: ApiSortParam[] = [];
    const sortString = req.query.sort;
    // Sort format: sort=field:direction&sort=field:direction
    if (sortString) {
      const sortArray = Array.isArray(sortString) ? sortString : [sortString];
      for (const sortStr of sortArray) {
        if (typeof sortStr !== "string") continue;

        const [field, direction] = sortStr.split(":");
        if (field && direction && (direction === "asc" || direction === "desc")) {
          sortParams.push({ field, direction: direction });
        }
      }
    }

    return sortParams;
  };

  generateQuery = (req: Request): QueryDto => {
    const filters = this.parseFilterString(req);
    const sorts = this.parseSortString(req);
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

    return { filters, sorts, page, pageSize };
  };
}
