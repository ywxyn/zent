import React from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash/throttle';
import Checkbox from '@youzan/zent-checkbox';

let rect;
let relativeTop;
const stickRowClass = 'stickrow';
const fixRowClass = 'fixrow';

const Head = React.createClass({
  getInitialState() {
    return {
      isShowFixRow: false
    };
  },

  componentDidMount() {
    if (this.props.autoStick) {
      let self = this;

      window.addEventListener('scroll', throttle(self.setHeadStyle, 100));
      window.addEventListener('resize', throttle(self.setHeadStyle, 100));

      this.getRect();
      self.setHeadStyle();
    }
  },

  getRect() {
    // clientrect can't be clone
    let tmpRect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    rect = {
      top: tmpRect.top,
      height: tmpRect.height,
      width: tmpRect.width
    };
    relativeTop = rect.top - document.body.getBoundingClientRect().top;
  },

  setHeadStyle() {
    this.getRect();
    if (window.scrollY > relativeTop) {
      this.setState({
        isShowFixRow: true,
        fixStyle: {
          position: 'fixed',
          top: 0,
          left: `${rect.left}px`,
          height: `${rect.height}px`,
          width: `${rect.width}px`,
          zIndex: 1000,
        }
      });
    } else {
      this.setState({
        isShowFixRow: false,
        fixStyle: {}
      });
    }
  },

  getChild(item) {
    if (item.needSort) {
      return (
        <a onClick={this.sort.bind(this, item)}>
          {item.title}
          {item.name === this.props.sortBy && <span className={this.props.sortType} />}
        </a>
      );
    }
    return item.title;
  },

  sort(item) {
    let sortType;
    let name = item.name;

    if (name === this.props.sortBy) {
      sortType = (this.props.sortType === 'desc' ? 'asc' : 'desc');  // toggble current sortType
    } else {
      sortType = 'desc'; // desc sort by default
    }

    this.props.onSort({
      sortBy: name,
      sortType
    });
  },

  onSelect(e) {
    let isChecked = false;
    if (e.target.checked) {
      isChecked = true;
    }

    this.props.selection.onSelectAll(isChecked);
  },

  renderTr(isFixTr, style = {}) {
    let { selection } = this.props;
    let needSelect = selection.needSelect;
    let width;
    let className = isFixTr ? fixRowClass : stickRowClass;

    return (
      <tr className={className} style={style} ref={(c) => { this[className] = c }}>
        {this.props.columns.map((item, index) => {
          let cellClass = 'cell';
          let num;
          if (index === 0 && needSelect) {
            cellClass += ' cell--selection';
          }

          if (item.isMoney) {
            cellClass += ' cell--money';
          }

          if (item.width) {
            width = `${item.width}`;
            if (!(/px$/.test(width))) {
              if (!(/%$/.test(width))) {
                width += '%';
              }
              num = parseFloat(width.replace(/%$/, ''), 10);
            }
          } else {
            width = '';
          }

          if (isFixTr) {
            if (!width) {
              num = rect.width / this.props.columns.length;
            }
            width = `${(num / 100 * rect.width).toFixed(2)}px`;
          }

          return (
            <th
              key={index}
              className={cellClass}
              width={width}
            >
                {
                  index === 0 && needSelect && (
                    <Checkbox
                      className="select-check"
                      onChange={this.onSelect}
                      checked={selection.isSelectAll}
                      indeterminate={selection.isSelectPart}
                    />
                  )
                }
                {this.getChild(item)}
            </th>
          );
        })}
      </tr>
    );
  },

  render() {
    let { style } = this.props;
    let { isShowFixRow, fixStyle } = this.state;

    return (
      <thead className="table__head" style={style}>
        {this.renderTr(false)}
        {isShowFixRow && this.renderTr(true, fixStyle)}
      </thead>
    );
  }
});

export default Head;