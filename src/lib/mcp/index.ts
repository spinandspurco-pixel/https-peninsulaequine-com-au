import { defineMcp, auth } from "@lovable.dev/mcp-js";
import listProjects from "./tools/list-projects";
import listServices from "./tools/list-services";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "peninsula-equine-mcp",
  title: "Peninsula Equine",
  version: "0.1.0",
  instructions:
    "Tools for Peninsula Equine — a Mornington Peninsula equine facilities builder. Use `list_projects` to read the live build register and `list_services` to see current service offerings. All tools are read-only.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProjects, listServices],
});
