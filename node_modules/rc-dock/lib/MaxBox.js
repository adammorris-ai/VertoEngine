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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxBox = void 0;
const React = __importStar(require("react"));
const DockPanel_1 = require("./DockPanel");
class MaxBox extends React.PureComponent {
    render() {
        let panelData = this.props.boxData.children[0];
        if (panelData) {
            this.hidePanelData = Object.assign(Object.assign({}, panelData), { id: '', tabs: [] });
            return (React.createElement("div", { className: "dock-box dock-mbox dock-mbox-show" },
                React.createElement(DockPanel_1.DockPanel, { size: 100, panelData: panelData })));
        }
        else if (this.hidePanelData) {
            // use the hiden data only once, dont keep it for too long
            let hidePanelData = this.hidePanelData;
            this.hidePanelData = null;
            return (React.createElement("div", { className: "dock-box dock-mbox dock-mbox-hide" },
                React.createElement(DockPanel_1.DockPanel, { size: 100, panelData: hidePanelData })));
        }
        else {
            return (React.createElement("div", { className: "dock-box dock-mbox dock-mbox-hide" }));
        }
    }
}
exports.MaxBox = MaxBox;
