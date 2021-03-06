"""Initial migration.

Revision ID: 84b5024e6a1e
Revises:
Create Date: 2020-10-22 19:08:03.691668

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '84b5024e6a1e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Upgrade the database from the previous version."""
    op.create_table('user',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('created', sa.DateTime(timezone=True),
                              server_default=sa.text('(CURRENT_TIMESTAMP)'),
                              nullable=False),
                    sa.Column('updated', sa.DateTime(timezone=True),
                              server_default=sa.text('(CURRENT_TIMESTAMP)'),
                              nullable=False),
                    sa.Column('email', sa.String(length=100), nullable=True),
                    sa.Column('username', sa.String(length=50),
                              nullable=False),
                    sa.Column('password', sa.String(length=400),
                              nullable=False),
                    sa.Column('authenticated', sa.Boolean(), nullable=False),
                    sa.Column('active', sa.Boolean(), nullable=False),
                    sa.Column('confirmed', sa.Boolean(), nullable=False),
                    sa.Column('confirmed_on', sa.DateTime(timezone=True),
                              nullable=True),
                    sa.Column('confirm_token', sa.String(length=100),
                              nullable=True),
                    sa.Column('reset_token', sa.String(length=100),
                              nullable=True),
                    sa.Column('api_key', sa.String(length=100), nullable=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('email'),
                    sa.UniqueConstraint('username'))
    op.create_table('shortlink',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('created', sa.DateTime(timezone=True),
                              server_default=sa.text('(CURRENT_TIMESTAMP)'),
                              nullable=False),
                    sa.Column('updated', sa.DateTime(timezone=True),
                              server_default=sa.text('(CURRENT_TIMESTAMP)'),
                              nullable=False),
                    sa.Column('user_id', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('paste',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('short_link_id', sa.Integer(), nullable=True),
                    sa.Column('language', sa.String(length=100),
                              nullable=False),
                    sa.Column('code', sa.Text(), nullable=False),
                    sa.Column('hash', sa.String(length=64), nullable=False),
                    sa.ForeignKeyConstraint(['short_link_id'],
                                            ['shortlink.id']),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('upload',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('short_link_id', sa.Integer(), nullable=True),
                    sa.Column('mimetype', sa.String(length=100),
                              nullable=False),
                    sa.Column('original_filename', sa.String(length=400),
                              nullable=False),
                    sa.Column('filename', sa.String(length=400),
                              nullable=True),
                    sa.Column('hash', sa.String(length=64), nullable=False),
                    sa.Column('expires', sa.DateTime(timezone=True),
                              nullable=False),
                    sa.ForeignKeyConstraint(['short_link_id'],
                                            ['shortlink.id']),
                    sa.PrimaryKeyConstraint('id'))
    op.create_table('url',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('short_link_id', sa.Integer(), nullable=True),
                    sa.Column('url', sa.String(length=2048), nullable=False),
                    sa.ForeignKeyConstraint(['short_link_id'],
                                            ['shortlink.id']),
                    sa.PrimaryKeyConstraint('id'))


def downgrade():
    """Downgrade the database to the previous version."""
    op.drop_table('url')
    op.drop_table('upload')
    op.drop_table('paste')
    op.drop_table('shortlink')
    op.drop_table('user')
