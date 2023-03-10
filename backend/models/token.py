from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    token_type: str


