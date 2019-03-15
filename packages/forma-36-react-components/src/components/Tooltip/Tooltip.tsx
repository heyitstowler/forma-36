import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import InViewport from '../InViewport';
import styles from './Tooltip.css';

export interface TooltipContainerProps {
  children: React.ReactNode;
  setRef: Function;
  containerElement: any;
  targetWrapperClassName?: string;
  onMouseLeave: Function;
  onMouseOver: Function;
  onFocus: Function;
  onBlur: Function;
}

const TooltipContainer: React.StatelessComponent<TooltipContainerProps> = (
  props: TooltipContainerProps,
) => {
  const {
    children,
    setRef,
    containerElement,
    targetWrapperClassName,
    ...otherProps
  } = props;
  const ContainerElement = containerElement;
  return (
    <ContainerElement
      ref={ref => setRef(ref)}
      className={cn(styles['Tooltip__target-wrapper'], targetWrapperClassName)}
      {...otherProps}
    >
      {children}
    </ContainerElement>
  );
};

export interface TooltipProps {
  targetWrapperClassName?: string;
  onFocus?: Function;
  onBlur?: Function;
  id?: string;
  onMouseLeave?: Function;
  containerElement?: React.ReactNode;
  onMouseOver?: Function;
  content?: React.ReactNode;
  children: React.ReactNode;
  place?: 'top' | 'bottom' | 'right' | 'left';
  isVisible?: boolean;
  maxWidth?: number | string;
  extraClassNames?: string;
  testId?: string;
}

export class Tooltip extends Component<TooltipProps> {
  static defaultProps = {
    onFocus: () => {},
    onBlur: () => {},
    onMouseLeave: () => {},
    onMouseOver: () => {},
    containerElement: 'span',
    isVisible: false,
    testId: 'cf-ui-tooltip',
    place: 'top',
    maxWidth: 360,
  };

  portalTarget = null;
  place = null;
  containerDomNode = null;
  tooltipDomNode = null;

  constructor(props) {
    super(props);
    this.portalTarget = document.createElement('div');
    this.place = props.place;
  }

  state = {
    isVisible: this.props.isVisible,
  };

  componentDidMount() {
    document.body.appendChild(this.portalTarget);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.content !== this.props.content) {
      this.forceUpdate();
    }
  }

  componentWillUnmount() {
    document.body.removeChild(this.portalTarget);
  }

  setPlace = place => {
    this.place = place;
  };

  calculatePosition = () => {
    if (!this.containerDomNode || !this.tooltipDomNode) {
      return { top: null, left: null };
    }

    let calculatedPosition = {};
    const containerRect = this.containerDomNode.getBoundingClientRect();
    const tooltipRect = this.tooltipDomNode.getBoundingClientRect();
    const carretVerticalOffset = 20;
    const carretHorizontalOffset = 12;

    switch (this.place) {
      case 'top':
        calculatedPosition = {
          left:
            containerRect.left +
            (containerRect.width / 2 - tooltipRect.width / 2),
          top: containerRect.top - (tooltipRect.height + carretVerticalOffset),
        };
        break;
      case 'bottom':
        calculatedPosition = {
          left:
            containerRect.left +
            (containerRect.width / 2 - tooltipRect.width / 2),
          top: containerRect.top + containerRect.height,
        };
        break;
      case 'left':
        calculatedPosition = {
          left:
            containerRect.left - (tooltipRect.width + carretHorizontalOffset),
          top: containerRect.top - tooltipRect.height / 2,
        };
        break;
      case 'right':
        calculatedPosition = {
          left:
            containerRect.left + (containerRect.width + carretHorizontalOffset),
          top: containerRect.top - tooltipRect.height / 2,
        };
        break;
      default:
        calculatedPosition = {};
    }
    return calculatedPosition;
  };

  renderTooltip = content => {
    const placeClass = `Tooltip--place-${this.place}`;
    const classNames = cn(
      styles['Tooltip'],
      styles[placeClass],
      this.props.extraClassNames,
      {
        [styles['Tooltip--hidden']]: !this.state.isVisible,
      },
    );
    const tooltip = (
      <div
        role="tooltip"
        id={this.props.id}
        aria-hidden={this.state.isVisible ? 'false' : 'true'}
        style={{
          ...this.calculatePosition(),
          maxWidth: this.props.maxWidth,
        }}
        ref={ref => {
          this.tooltipDomNode = ref;
        }}
        contentEditable={false}
        onFocus={() => {
          this.setState({ isVisible: false });
        }}
        onMouseOver={() => {
          this.setState({ isVisible: false });
        }}
        className={classNames}
        data-test-id={this.props.testId}
      >
        <InViewport
          onOverflowTop={() => this.setPlace('bottom')}
          onOverflowLeft={() => this.setPlace('right')}
          onOverflowBottom={() => this.setPlace('top')}
          onOverflowRight={() => this.setPlace('left')}
        >
          {content}
        </InViewport>
      </div>
    );

    return ReactDOM.createPortal(tooltip, this.portalTarget);
  };

  render() {
    const {
      extraClassNames,
      targetWrapperClassName,
      content,
      onMouseLeave,
      onMouseOver,
      onFocus,
      containerElement,
      onBlur,
      children,
      place,
      isVisible,
      testId,
      maxWidth,
      ...otherProps
    } = this.props;

    return (
      <TooltipContainer
        containerElement={containerElement}
        onMouseOver={e => {
          this.setState({ isVisible: true });
          onMouseOver(e);
        }}
        onMouseLeave={e => {
          this.setState({ isVisible: false });
          onMouseLeave(e);
        }}
        onFocus={e => {
          this.setState({ isVisible: true });
          onFocus(e);
        }}
        onBlur={e => {
          this.setState({ isVisible: false });
          onBlur(e);
        }}
        setRef={ref => {
          this.containerDomNode = ref;
        }}
        targetWrapperClassName={targetWrapperClassName}
        aria-describedby={this.props.id}
        {...otherProps}
      >
        <React.Fragment>
          {children}
          {content && this.renderTooltip(content)}
        </React.Fragment>
      </TooltipContainer>
    );
  }
}

export default Tooltip;