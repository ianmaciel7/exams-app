"""Test-only deterministic fake for claude_artifact_cli, no OAuth/network access."""
class FakeAuth:
    @staticmethod
    def get_token():
        return "TEST_ONLY_FAKE_TOKEN_DO_NOT_USE"

auth = FakeAuth()


class FrameClient:
    def __init__(self, token):
        assert token == "TEST_ONLY_FAKE_TOKEN_DO_NOT_USE"
        self.documents = {}

    def db(self, slug, verb, args):
        if slug != "34cd390a-738f-4dfc-8ae2-6c4f90794d74":
            raise RuntimeError("Unexpected artifact")
        if args.get("path") == "bridge-poc/raise-upstream":
            raise RuntimeError("Bearer confidential-upstream-secret")
        path = args.get("path", "")
        if verb == "get":
            if path not in self.documents:
                return {"exists": False, "version": None}
            return {"exists": True, "data": self.documents[path]["data"],
                    "version": self.documents[path]["version"]}
        if verb == "set":
            old = self.documents.get(path)
            version = (old["version"] if old else 0) + 1
            self.documents[path] = {"data": args["data"], "version": version}
            return {"version": version}
        if verb == "list":
            prefix = args["collection"] + "/"
            return {"docs": [{"id": p[len(prefix):], **v}
                             for p, v in self.documents.items() if p.startswith(prefix)]}
        if verb == "delete":
            self.documents.pop(path, None)
            return {"deleted": True}
        raise RuntimeError("Invalid verb")


class FakeApi:
    FrameClient = FrameClient

api = FakeApi()
