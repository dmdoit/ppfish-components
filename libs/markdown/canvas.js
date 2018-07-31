import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import marked from 'marked'
import {transform} from 'babel-standalone'
import Editor from '../editor'

//代码展示容器
export default class Canvas extends React.Component {
  constructor(props) {
    super(props);

    this.playerId = `${parseInt(Math.random() * 1e9).toString(36)}`;
    this.document = this.props.children.match(/([^]*)\n?(```[^]+```)/);
    this.description = marked(this.document[1]);
    this.source = this.document[2].match(/```(.*)\n?([^]+)```/);

    this.state = {
      showBlock: false
    }
  }

  componentDidMount() {
    this.renderSource(this.source[2])
  }

  blockControl() {
    this.setState({
      showBlock: !this.state.showBlock
    })
  }

  renderSource(value) {
    //dynamic import
    import('./source').then(Element => {
      const args = ['context', 'React', 'ReactDOM'];
      const argv = [this, React, ReactDOM];
      for (const key in Element) {
        args.push(key);
        argv.push(Element[key])
      }

      return {
        args,
        argv
      }
    }).then(({args, argv}) => {
      let code;
      //多个class写法,需要return一个Demo对象
      if (/class.*extends React.Component/.test(value)) {
        code = transform(`
        ${value}
        ReactDOM.render(<Demo {...context.props} />, 
        document.getElementById('${this.playerId}'))
      `, {
          presets: ['react', 'stage-2', 'stage-1']
        }).code;
      } else {
        //单个class写关键部分内容
        code = transform(`
        class Demo extends React.Component {
          ${value}
        }
        ReactDOM.render(<Demo {...context.props} />, 
        document.getElementById('${this.playerId}'))
      `, {
          presets: ['react', 'stage-2', 'stage-1']
        }).code;
      }
      args.push(code);
      //render to playrId div
      new Function(...args).apply(null, argv);
      this.source[2] = value
    }).catch((err) => {
      if (process.env.NODE_ENV !== 'production') {
        throw err;
      }
    })
  }

  render() {
    return (
      <div className={`demo-block demo-box demo-${this.props.name}`}>
        <div className="source" id={this.playerId}/>
        {
          this.state.showBlock && (
            <div className="meta">
              {
                this.description && (
                  <div
                    ref="description"
                    className="description"
                    dangerouslySetInnerHTML={{__html: this.description}}
                  />
                )
              }
              <Editor
                value={this.source[2]}
                onChange={code => this.renderSource(code)}
              />
            </div>
          )
        }
        <div className="demo-block-control" onClick={this.blockControl.bind(this)}>
          {
            this.state.showBlock ? (
              <span>
                <i className="el-icon-caret-top"/>{this.props.locale.hide}
              </span>
            ) : (
              <span>
                <i className="el-icon-caret-bottom"/>{this.props.locale.show}
              </span>
            )
          }
        </div>
      </div>
    )
  }
}

Canvas.propTypes = {
  locale: PropTypes.object
};

Canvas.defaultProps = {
  locale: {
    hide: '隐藏代码',
    show: '显示代码'
  }
};