from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class EventRecord(db.Model):
    __tablename__ = 'event_records'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))
    date = db.Column(db.String(20))
    organiser = db.Column(db.String(100))
    # 状态字段 [cite: 27, 28]
    status = db.Column(db.String(20), default="PENDING") 
    category = db.Column(db.String(20))
    priority = db.Column(db.String(20))
    note = db.Column(db.String(200))