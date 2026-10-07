"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-10-07 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('python_file_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('test_file_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='PROCESSED', nullable=False),
        sa.Column('extracted_path', sa.String(length=500), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)

    # 2. Bugs table
    severity_enum = sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='severity_level')
    status_enum = sa.Enum('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', name='bug_status')

    op.create_table(
        'bugs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', severity_enum, nullable=False),
        sa.Column('status', status_enum, nullable=False),
        sa.Column('affected_file', sa.String(length=255), nullable=False),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bugs_id'), 'bugs', ['id'], unique=False)

    # 3. Bug Analyses table
    op.create_table(
        'bug_analyses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('bug_id', sa.Integer(), nullable=False),
        sa.Column('detected_snippet', sa.Text(), nullable=True),
        sa.Column('potential_cause', sa.Text(), nullable=False),
        sa.Column('suggested_fix', sa.Text(), nullable=True),
        sa.Column('reproduction_steps', sa.Text(), nullable=False),
        sa.Column('analyzed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['bug_id'], ['bugs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('bug_id')
    )
    op.create_index(op.f('ix_bug_analyses_id'), 'bug_analyses', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_bug_analyses_id'), table_name='bug_analyses')
    op.drop_table('bug_analyses')
    op.drop_index(op.f('ix_bugs_id'), table_name='bugs')
    op.drop_table('bugs')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')
    op.execute("DROP TYPE IF EXISTS bug_status")
    op.execute("DROP TYPE IF EXISTS severity_level")
