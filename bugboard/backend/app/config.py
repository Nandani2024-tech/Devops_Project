import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bugboard_user:bugboard_pass@postgres:5432/bugboard_db"
    UPLOAD_DIR: str = "/data/uploads"
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return list(self.CORS_ORIGINS)

    def get_upload_dir(self) -> str:
        # Fallback to ./uploads locally if /data/uploads cannot be created (e.g. Windows)
        target = self.UPLOAD_DIR
        try:
            os.makedirs(target, exist_ok=True)
            return target
        except (OSError, PermissionError):
            local_uploads = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
            os.makedirs(local_uploads, exist_ok=True)
            return local_uploads

settings = Settings()
