import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.letters.models import Letter
from app.domains.letters.enums import LetterStatus


router = APIRouter()


@router.get("")
def get_public_letters(
    db: Session = Depends(get_db),
):

    letters = (
        db.query(Letter)
        .filter(
            Letter.status == LetterStatus.PUBLISHED
        )
        .order_by(
            Letter.written_date.asc()
        )
        .all()
    )


    return [
        {
            "id": str(letter.id),
            "title": letter.title,
            "written_date": (
                str(letter.written_date)
                if letter.written_date
                else None
            ),
        }
        for letter in letters
    ]