from pydantic_settings import BaseSettings
from typing import Optional, List, Union
from pydantic import Field, field_validator, AliasChoices


class Settings(BaseSettings):
    openai_api_key: str
    qdrant_url: str
    qdrant_api_key: Optional[str] = None
    qdrant_collection: str
    database_url: str = Field(validation_alias='DATABASE_URL')  # DATABASE_URL is required
    cors_origins: Union[str, List[str]] = '*'  # Accept either string or list, will be processed by validator
    embedding_model: str = "text-embedding-ada-002"  # Default embedding model
    chat_model: str = "gpt-3.5-turbo"  # Default chat model

    model_config = {'env_file': '.env', 'extra': 'forbid'}  # Don't allow arbitrary extra keys

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse comma-separated string to list of origins"""
        if isinstance(v, str):
            if v == '*' or v == '':
                return ['*']
            else:
                return [origin.strip() for origin in v.split(',')]
        elif isinstance(v, list):
            return v  # Already a list, return as is
        return v


settings = Settings()