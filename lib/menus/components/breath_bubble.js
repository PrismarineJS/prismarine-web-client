class BreathBubble extends LitElement {
    static get styles () {
        return `
        .breath {
            width: 9px;
            height: 9px;
            margin-left: -1px;
          }
    
          .breath.full {
            background-image: url('textures/1.17.1/gui/icons.png');
            background-size: 256px;
            background-position: var(--offset) var(--bg-y);
          }
    
          .breath.half {
            background-image: url('textures/1.17.1/gui/icons.png');
            background-size: 256px;
            background-position: calc(var(--offset) - 9) var(--bg-y);
          }
        `
    }
}

window.customElements.define('pmui-breathbubble', BreathBubble)