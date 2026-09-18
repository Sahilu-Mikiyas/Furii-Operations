import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { m as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { T as TSS_SERVER_FUNCTION, b as getServerFnById } from "./server-DhrmKQ4T.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const WorkspaceContext = reactExports.createContext(null);
const LS_KEY = "ros.currentWorkspaceId";
const LS_SCOPE = "ros.scope";
function WorkspaceProvider({
  workspaces,
  children
}) {
  const [currentId, setCurrentIdState] = reactExports.useState(null);
  const [scope, setScopeState] = reactExports.useState("personal");
  const [preferencesReady, setPreferencesReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedWorkspaceId = localStorage.getItem(LS_KEY);
    const storedScope = localStorage.getItem(LS_SCOPE);
    setCurrentIdState(storedWorkspaceId);
    if (storedScope === "personal" || storedScope === "shared") {
      setScopeState(storedScope);
    }
    setPreferencesReady(true);
  }, []);
  reactExports.useEffect(() => {
    if (!preferencesReady) return;
    if (!currentId || !workspaces.find((w) => w.id === currentId)) {
      const first = workspaces[0]?.id ?? null;
      setCurrentIdState(first);
      if (typeof window !== "undefined" && first) localStorage.setItem(LS_KEY, first);
    }
  }, [workspaces, currentId, preferencesReady]);
  const setCurrentId = (id) => {
    setCurrentIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, id);
  };
  const setScope = (s) => {
    setScopeState(s);
    if (typeof window !== "undefined") localStorage.setItem(LS_SCOPE, s);
  };
  const current = reactExports.useMemo(
    () => workspaces.find((w) => w.id === currentId) ?? workspaces[0] ?? null,
    [workspaces, currentId]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(WorkspaceContext.Provider, { value: { workspaces, current, setCurrentId, scope, setScope }, children });
}
function useWorkspace() {
  const ctx = reactExports.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
export {
  WorkspaceProvider as W,
  useWorkspace as a,
  createSsrRpc as c,
  useServerFn as u
};
