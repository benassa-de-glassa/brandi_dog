"""Extension to the OAuth2 password bearer class from FastAPI

The code is mostly copied from 
https://medium.com/data-rebels/fastapi-how-to-add-basic-and-cookie-authentication-a45c85ef47d3
"""

from typing import Optional

from loguru import logger

from fastapi import HTTPException
from fastapi.security import OAuth2
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.openapi.models import OAuthFlow

from starlette.requests import Request
from starlette.status import HTTP_403_FORBIDDEN


class OAuth2PasswordBearerCookie(OAuth2):
    """Extension to the standard OAuth2PasswordBearer class by FastAPI
    
    Originally the OAuth2PasswordBearer class only works with authorization 
    headers. This adds cookie functionality. It tries to obtain authorization
    through both headers and cookies and it only fails if neither is present. 
    """

    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlow(password={'tokenUrl': tokenUrl, 'scopes': scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        """Turns the class into a callable
        
        This allows it to be used as a dependency by FastAPI
        """

        logger.debug(f'Obtained OAuth2 cookie')

        header_authorization: str = request.headers.get('Authorization')
        cookie_authorization: str = request.cookies.get('Authorization')

        # obtain the token from a utils function
        header_scheme, header_param = get_authorization_scheme_param(
            header_authorization
        )

        cookie_scheme, cookie_param = get_authorization_scheme_param(
            cookie_authorization
        )

        if header_scheme.lower() == 'bearer':
            # a header was detected
            authorization = True
            scheme = header_scheme
            param = header_param

        elif cookie_scheme.lower() == 'bearer':
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else: 
            authorization = False

        # scheme could be basic
        if not authorization or scheme.lower() != 'bearer':
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN
                )
            else:
                return None

        # return the token
        return param

