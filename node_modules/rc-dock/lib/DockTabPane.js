"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const DockData_1 = require("./DockData");
class DockTabPane extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
        };
    }
    updateCache() {
        const { cached, children, cacheId } = this.props;
        if (this._cache) {
            if (!cached || cacheId !== this._cache.id) {
                this.context.removeTabCache(this._cache.id, this);
                this._cache = null;
            }
        }
        if (cached && this._ref) {
            this._cache = this.context.getTabCache(cacheId, this);
            if (!this._ref.contains(this._cache.div)) {
                this._ref.appendChild(this._cache.div);
            }
            this.context.updateTabCache(this._cache.id, children);
        }
    }
    render() {
        const { cacheId, cached, prefixCls, forceRender, className, style, id, active, 
        // destroyInactiveTabPane, // Not in @rc-component/tabs TabPaneProps
        tabKey, children, } = this.props;
        if (active) {
            this.visited = true;
        } // Removed destroyInactiveTabPane check
        const mergedStyle = {};
        if (!active) {
            mergedStyle.display = 'none';
        }
        // when cached == undefined, it will still cache the children inside tabs component, but not across whole dock layout
        // when cached == false, children are destroyed when not active
        const isRender = cached === false ? active : this.visited;
        let renderChildren = null;
        if (cached) {
            renderChildren = null;
        }
        else if (isRender || forceRender) {
            renderChildren = children;
        }
        let getRef = cached ? this.getRef : null;
        return (React.createElement("div", { ref: getRef, id: cacheId, role: "tabpanel", "aria-labelledby": id && `${id}-tab-${tabKey}`, "aria-hidden": !active, style: Object.assign(Object.assign({}, mergedStyle), style), className: (0, classnames_1.default)(`${prefixCls}-tabpane`, active && `${prefixCls}-tabpane-active`, className) }, (active || this.visited || forceRender) && renderChildren));
    }
    componentDidMount() {
        this.updateCache();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateCache();
    }
    componentWillUnmount() {
        if (this._cache) {
            this.context.removeTabCache(this._cache.id, this);
        }
    }
}
DockTabPane.contextType = DockData_1.DockContextType;
exports.default = DockTabPane;
