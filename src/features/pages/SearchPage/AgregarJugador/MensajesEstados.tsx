import * as React from 'react';

interface MensajesEstadoProps {
  error?: string | null;
  errorSecundario?: string | null;
  success?: string | null;
  warning?: string | null;
  info?: string | null;
  className?: string;
}

type MessageType = 'error' | 'success' | 'warning' | 'info';

interface MessageConfig {
  icon: string;
  className: string;
  ariaRole: string;
}

const MESSAGE_CONFIGS: Record<MessageType, MessageConfig> = {
  error: {
    icon: '❌',
    className: 'error-message',
    ariaRole: 'alert'
  },
  success: {
    icon: '✅',
    className: 'success-message',
    ariaRole: 'status'
  },
  warning: {
    icon: '⚠️',
    className: 'warning-message',
    ariaRole: 'alert'
  },
  info: {
    icon: 'ℹ️',
    className: 'info-message',
    ariaRole: 'status'
  }
};

interface MessageItemProps {
  type: MessageType;
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  type, 
  message, 
  onDismiss,
  autoHide = false,
  duration = 5000 
}) => {
  const config = MESSAGE_CONFIGS[type];
  
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss, duration]);

  return (
    <div 
      className={`message-item ${config.className}`}
      role={config.ariaRole}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="message-content">
        <span className="message-icon" aria-hidden="true">
          {config.icon}
        </span>
        <span className="message-text">{message}</span>
      </div>
      
      {onDismiss && (
        <button
          className="message-dismiss"
          onClick={onDismiss}
          aria-label="Cerrar mensaje"
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
};

const MensajesEstado: React.FC<MensajesEstadoProps> = ({
  error,
  errorSecundario,
  success,
  warning,
  info,
  className = ""
}) => {
  const [dismissedMessages, setDismissedMessages] = React.useState<Set<string>>(new Set());

  const handleDismiss = (messageKey: string) => {
    setDismissedMessages(prev => new Set([...prev, messageKey]));
  };

  const messages = React.useMemo(() => {
    const messageList: Array<{ key: string; type: MessageType; message: string; autoHide?: boolean }> = [];

    if (error && !dismissedMessages.has('error')) {
      messageList.push({ key: 'error', type: 'error', message: error });
    }

    if (errorSecundario && !dismissedMessages.has('errorSecundario')) {
      messageList.push({ key: 'errorSecundario', type: 'error', message: errorSecundario });
    }

    if (success && !dismissedMessages.has('success')) {
      messageList.push({ key: 'success', type: 'success', message: success, autoHide: true });
    }

    if (warning && !dismissedMessages.has('warning')) {
      messageList.push({ key: 'warning', type: 'warning', message: warning });
    }

    if (info && !dismissedMessages.has('info')) {
      messageList.push({ key: 'info', type: 'info', message: info, autoHide: true });
    }

    return messageList;
  }, [error, errorSecundario, success, warning, info, dismissedMessages]);

  // Limpiar mensajes descartados cuando cambien los props
  React.useEffect(() => {
    setDismissedMessages(new Set());
  }, [error, errorSecundario, success, warning, info]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={`mensajes-estado ${className}`} aria-live="polite">
      <div className="mensajes-container">
        {messages.map((msg) => (
          <MessageItem
            key={msg.key}
            type={msg.type}
            message={msg.message}
            autoHide={msg.autoHide}
            onDismiss={() => handleDismiss(msg.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default MensajesEstado;