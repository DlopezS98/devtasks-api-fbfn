import "module-alias/register";
import { addAliases } from "module-alias";
import * as path from "path";

addAliases({
  "@Application": path.resolve(__dirname, "application"),
  "@Domain": path.resolve(__dirname, "domain"),
  "@Infrastructure": path.resolve(__dirname, "infrastructure"),
  "@Api": path.resolve(__dirname, "api"),
});
