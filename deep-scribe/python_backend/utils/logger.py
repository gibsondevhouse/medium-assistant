import json
import logging
import sys
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings compatible with the Electron logger.
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "data": {
                "logger": record.name,
                "module": record.module,
                "line": record.lineno
            }
        }

        # Add exception info if present
        if record.exc_info:
            log_record["data"]["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record)

def setup_logger():
    """
    Configures the root logger to output JSON to stdout.
    This allows the Electron parent process to capture and merge these logs.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    
    # Remove existing handlers to avoid duplicates
    logger.handlers = []
    logger.addHandler(handler)
    
    return logger

# Global logger instance
logger = setup_logger()
