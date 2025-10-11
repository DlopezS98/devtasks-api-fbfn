import "module-alias/register";
import * as path from "path";

import { addAliases } from "module-alias";

addAliases({
  "@Application": path.resolve(__dirname, "application"),
  "@Domain": path.resolve(__dirname, "domain"),
  "@Infrastructure/Firebase": path.resolve(__dirname, "infrastructure"),
  "@Shared": path.resolve(__dirname, "shared"),
  "@Api": path.resolve(__dirname, "api"),
});
