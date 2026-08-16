import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.domains.letters.models import Letter
from app.domains.letters.enums import LetterStatus


from fastapi import HTTPException

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



@router.get("/{letter_id}")
def get_public_letter(
    letter_id: uuid.UUID,
    db: Session = Depends(get_db),
):

    letter = (
        db.query(Letter)
        .filter(
            Letter.id == letter_id,
            Letter.status == LetterStatus.PUBLISHED
        )
        .first()
    )


    if not letter:
        raise HTTPException(
            status_code=404,
            detail="Letter not found"
        )


    return {
        "id": str(letter.id),
        "title": letter.title,
        "body": letter.body,
        "written_date":
            str(letter.written_date)
            if letter.written_date
            else None
    }