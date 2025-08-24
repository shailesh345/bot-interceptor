#!/usr/bin/env python3
"""
Database Optimization Utility
Handles database indexing, query optimization, and performance tuning
"""

from app.models import db
from sqlalchemy import text, create_engine, MetaData, Table, Index
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any, Optional
import logging
import time
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    """Database optimization and indexing utility"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize with Flask app"""
        self.app = app
        self.engine = db.engine
        self.metadata = MetaData()
        self.metadata.reflect(bind=self.engine)
    
    def create_recommended_indexes(self) -> Dict[str, Any]:
        """Create recommended indexes for common query patterns"""
        try:
            results = {}
            
            # Index for user lookups
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_users_email 
                    ON users(email)
                """))
                results['users_email'] = 'Created index on users.email'
            except Exception as e:
                results['users_email'] = f'Failed to create index: {e}'
            
            # Index for domain lookups
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_domains_tenant_status 
                    ON domains(tenant_id, status)
                """))
                results['domains_tenant_status'] = 'Created index on domains(tenant_id, status)'
            except Exception as e:
                results['domains_tenant_status'] = f'Failed to create index: {e}'
            
            # Index for traffic logs (most important for performance)
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_traffic_logs_domain_timestamp 
                    ON traffic_logs(domain_id, timestamp)
                """))
                results['traffic_logs_domain_timestamp'] = 'Created index on traffic_logs(domain_id, timestamp)'
            except Exception as e:
                results['traffic_logs_domain_timestamp'] = f'Failed to create index: {e}'
            
            # Index for traffic logs by client IP
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_traffic_logs_client_ip 
                    ON traffic_logs(client_ip)
                """))
                results['traffic_logs_client_ip'] = 'Created index on traffic_logs(client_ip)'
            except Exception as e:
                results['traffic_logs_client_ip'] = f'Failed to create index: {e}'
            
            # Index for analytics
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_analytics_domain_date 
                    ON analytics(domain_id, date)
                """))
                results['analytics_domain_date'] = 'Created index on analytics(domain_id, date)'
            except Exception as e:
                results['analytics_domain_date'] = f'Failed to create index: {e}'
            
            # Index for billing
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_status 
                    ON subscriptions(tenant_id, status)
                """))
                results['subscriptions_tenant_status'] = 'Created index on subscriptions(tenant_id, status)'
            except Exception as e:
                results['subscriptions_tenant_status'] = f'Failed to create index: {e}'
            
            # Index for security logs
            try:
                self.engine.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_security_logs_user_timestamp 
                    ON security_logs(user_id, timestamp)
                """))
                results['security_logs_user_timestamp'] = 'Created index on security_logs(user_id, timestamp)'
            except Exception as e:
                results['security_logs_user_timestamp'] = f'Failed to create index: {e}'
            
            return {
                'status': 'success',
                'indexes_created': results,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def analyze_query_performance(self, query: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze query performance and provide optimization suggestions"""
        try:
            start_time = time.time()
            
            # Execute query
            if params:
                result = db.session.execute(text(query), params)
            else:
                result = db.session.execute(text(query))
            
            execution_time = time.time() - start_time
            
            # Get result count
            if result.returns_rows:
                rows = result.fetchall()
                row_count = len(rows)
            else:
                row_count = 0
            
            # Analyze query for optimization opportunities
            suggestions = self._analyze_query_structure(query)
            
            return {
                'query': query,
                'execution_time_ms': round(execution_time * 1000, 2),
                'row_count': row_count,
                'suggestions': suggestions,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return {
                'query': query,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _analyze_query_structure(self, query: str) -> List[str]:
        """Analyze query structure for optimization suggestions"""
        suggestions = []
        query_upper = query.upper()
        
        # Check for SELECT *
        if 'SELECT *' in query_upper:
            suggestions.append("Consider selecting only needed columns instead of SELECT *")
        
        # Check for missing WHERE clause
        if 'SELECT' in query_upper and 'WHERE' not in query_upper:
            suggestions.append("Consider adding WHERE clause to limit results")
        
        # Check for ORDER BY without LIMIT
        if 'ORDER BY' in query_upper and 'LIMIT' not in query_upper:
            suggestions.append("Consider adding LIMIT clause when using ORDER BY")
        
        # Check for LIKE with leading wildcard
        if "LIKE '%" in query:
            suggestions.append("Leading wildcards in LIKE queries can't use indexes effectively")
        
        # Check for multiple OR conditions
        if query_upper.count(' OR ') > 2:
            suggestions.append("Multiple OR conditions might benefit from UNION queries")
        
        # Check for subqueries
        if '(' in query and 'SELECT' in query_upper:
            suggestions.append("Consider using JOINs instead of subqueries for better performance")
        
        return suggestions
    
    def get_table_statistics(self) -> Dict[str, Any]:
        """Get detailed table statistics for optimization"""
        try:
            tables = [
                'users', 'tenants', 'domains', 'traffic_logs', 'analytics', 
                'billing_plans', 'subscriptions', 'security_logs', 'audit_logs'
            ]
            
            stats = {}
            for table in tables:
                try:
                    # Get row count
                    row_count = db.session.execute(
                        text(f'SELECT COUNT(*) FROM {table}')
                    ).scalar()
                    
                    # Get table size (SQLite-specific)
                    table_info = db.session.execute(
                        text(f"PRAGMA table_info({table})")
                    ).fetchall()
                    
                    # Get index info
                    indexes = db.session.execute(
                        text(f"PRAGMA index_list({table})")
                    ).fetchall()
                    
                    stats[table] = {
                        'row_count': row_count,
                        'column_count': len(table_info),
                        'index_count': len(indexes),
                        'last_analyzed': datetime.utcnow().isoformat()
                    }
                    
                except Exception as e:
                    stats[table] = {'error': str(e)}
            
            return {
                'status': 'success',
                'table_statistics': stats,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting table statistics: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def optimize_database(self) -> Dict[str, Any]:
        """Run comprehensive database optimization"""
        try:
            results = {}
            
            # VACUUM database
            start_time = time.time()
            db.session.execute(text('VACUUM'))
            vacuum_time = time.time() - start_time
            results['vacuum'] = f'Completed in {vacuum_time:.2f}s'
            
            # ANALYZE database
            start_time = time.time()
            db.session.execute(text('ANALYZE'))
            analyze_time = time.time() - start_time
            results['analyze'] = f'Completed in {analyze_time:.2f}s'
            
            # REINDEX database
            start_time = time.time()
            db.session.execute(text('REINDEX'))
            reindex_time = time.time() - start_time
            results['reindex'] = f'Completed in {reindex_time:.2f}s'
            
            # Update statistics
            db.session.commit()
            
            return {
                'status': 'success',
                'optimization_results': results,
                'total_time': sum([vacuum_time, analyze_time, reindex_time]),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing database: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current database performance metrics"""
        try:
            metrics = {}
            
            # Test common query patterns
            query_tests = {
                'user_lookup': 'SELECT COUNT(*) FROM users WHERE is_active = 1',
                'domain_lookup': 'SELECT COUNT(*) FROM domains WHERE status = "active"',
                'traffic_analysis': 'SELECT COUNT(*) FROM traffic_logs WHERE timestamp > datetime("now", "-1 day")',
                'billing_lookup': 'SELECT COUNT(*) FROM subscriptions WHERE status = "active"'
            }
            
            for test_name, query in query_tests.items():
                start_time = time.time()
                try:
                    result = db.session.execute(text(query)).scalar()
                    execution_time = time.time() - start_time
                    metrics[test_name] = {
                        'execution_time_ms': round(execution_time * 1000, 2),
                        'result': result,
                        'status': 'success'
                    }
                except Exception as e:
                    metrics[test_name] = {
                        'execution_time_ms': 0,
                        'error': str(e),
                        'status': 'error'
                    }
            
            # Get database size
            try:
                db_size = self._get_database_size()
                metrics['database_size_mb'] = db_size
            except:
                metrics['database_size_mb'] = 'Unknown'
            
            return {
                'status': 'success',
                'metrics': metrics,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _get_database_size(self) -> float:
        """Get database file size in MB"""
        try:
            import os
            db_path = self.app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
            if db_path and os.path.exists(db_path):
                size_bytes = os.path.getsize(db_path)
                return round(size_bytes / (1024 * 1024), 2)
            return 0
        except:
            return 0
    
    def create_custom_index(self, table: str, columns: List[str], index_name: Optional[str] = None) -> Dict[str, Any]:
        """Create a custom index on specified table and columns"""
        try:
            if not index_name:
                index_name = f"idx_{table}_{'_'.join(columns)}"
            
            columns_str = ', '.join(columns)
            query = f"CREATE INDEX IF NOT EXISTS {index_name} ON {table}({columns_str})"
            
            start_time = time.time()
            db.session.execute(text(query))
            execution_time = time.time() - start_time
            
            return {
                'status': 'success',
                'index_name': index_name,
                'table': table,
                'columns': columns,
                'execution_time_ms': round(execution_time * 1000, 2),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating custom index: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def drop_index(self, index_name: str) -> Dict[str, Any]:
        """Drop a specific index"""
        try:
            query = f"DROP INDEX IF EXISTS {index_name}"
            
            start_time = time.time()
            db.session.execute(text(query))
            execution_time = time.time() - start_time
            
            return {
                'status': 'success',
                'index_name': index_name,
                'execution_time_ms': round(execution_time * 1000, 2),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error dropping index: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# Global database optimizer instance
db_optimizer = DatabaseOptimizer()

def init_database_optimizer(app):
    """Initialize database optimizer with Flask app"""
    db_optimizer.init_app(app)
    return db_optimizer
