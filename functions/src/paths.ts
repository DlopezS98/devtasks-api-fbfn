import "module-alias/register";
import * as path from "path";

import { addAliases } from "module-alias";

addAliases({
  "@Application": path.resolve(__dirname, "application"),
  "@Domain": path.resolve(__dirname, "domain"),
  "@Infrastructure": path.resolve(__dirname, "infrastructure"),
  "@Api": path.resolve(__dirname, "api"),
});
