window.nexusGraph = {
    instance: null,
    allNodes: null,
    allEdges: null,
    dotNetRef: null,
    containerId: null,
    isFiltered: false,

    colorMap: {
        'Implication': '#37e08a',
        'Contradiction': '#ff5a52',
        'Dependency': '#ffb02e',
        'Supersession': '#9fb0a6',
        'Reinforcement': '#8fe0b0',
        'Tension': '#ff8a3c'
    },

    init: function (containerId, nodes, edges, dotNetRef) {
        this.allNodes = nodes;
        this.allEdges = edges;
        this.dotNetRef = dotNetRef;
        this.containerId = containerId;
        this.isFiltered = false;

        var container = document.getElementById(containerId);
        if (!container || typeof cytoscape === 'undefined') return;
        var self = this;

        this.instance = cytoscape({
            container: container,
            elements: this._buildElements(nodes, edges),
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)', 'text-wrap': 'wrap', 'text-max-width': '120px',
                        'font-size': '11px', 'text-valign': 'center', 'text-halign': 'center',
                        'background-color': '#132019', 'border-color': '#3a7a52', 'border-width': 2,
                        'width': 140, 'height': 50, 'shape': 'round-rectangle', 'color': '#d7f5e4'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'label': 'data(label)', 'font-size': '9px', 'color': '#8fc7a6',
                        'text-rotation': 'autorotate', 'text-margin-y': -10, 'width': 2,
                        'line-color': 'data(color)', 'target-arrow-color': 'data(color)',
                        'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'arrow-scale': 1.2
                    }
                },
                {
                    selector: '.dimmed',
                    style: { 'opacity': 0.12 }
                },
                {
                    selector: '.highlighted',
                    style: { 'opacity': 1 }
                },
                {
                    selector: 'node.highlighted',
                    style: { 'border-color': '#37e08a', 'border-width': 3, 'background-color': '#1a2e22' }
                },
                {
                    selector: 'edge.highlighted',
                    style: { 'width': 4 }
                }
            ],
            layout: { name: 'cose', animate: true, animationDuration: 500, nodeRepulsion: 8000, idealEdgeLength: 200, padding: 30 },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false
        });

        this.instance.on('tap', 'node', function (evt) {
            if (self.isFiltered) {
                self._clearHighlight();
                self.dotNetRef.invokeMethodAsync('OnGraphBackgroundClicked');
            } else {
                self._highlightNode(evt.target.id());
                self.dotNetRef.invokeMethodAsync('OnGraphNodeClicked', evt.target.id());
            }
        });
        this.instance.on('tap', 'edge', function (evt) {
            if (self.isFiltered) {
                self._clearHighlight();
                self.dotNetRef.invokeMethodAsync('OnGraphBackgroundClicked');
            } else {
                self._highlightEdge(evt.target.id());
                self.dotNetRef.invokeMethodAsync('OnGraphEdgeClicked', evt.target.id());
            }
        });
        this.instance.on('tap', function (evt) {
            if (evt.target === self.instance && self.isFiltered) {
                self._clearHighlight();
                self.dotNetRef.invokeMethodAsync('OnGraphBackgroundClicked');
            }
        });
    },

    _buildElements: function (nodes, edges) {
        var self = this;
        return {
            nodes: nodes.map(function (n) { return { data: { id: n.id, label: n.label, recommendation: n.recommendation } }; }),
            edges: edges.map(function (e) { return { data: { id: e.id, source: e.source, target: e.target, label: e.nexusType, nexusType: e.nexusType, color: self.colorMap[e.nexusType] || '#9fb0a6' } }; })
        };
    },

    _highlightNode: function (nodeId) {
        this.isFiltered = true;
        var cy = this.instance;
        var node = cy.getElementById(nodeId);
        var neighbourhood = node.closedNeighborhood();
        cy.elements().addClass('dimmed').removeClass('highlighted');
        neighbourhood.removeClass('dimmed').addClass('highlighted');
    },

    _highlightEdge: function (edgeId) {
        this.isFiltered = true;
        var cy = this.instance;
        var edge = cy.getElementById(edgeId);
        var endpoints = edge.connectedNodes();
        var group = edge.union(endpoints);
        cy.elements().addClass('dimmed').removeClass('highlighted');
        group.removeClass('dimmed').addClass('highlighted');
    },

    _clearHighlight: function () {
        this.isFiltered = false;
        this.instance.elements().removeClass('dimmed highlighted');
    },

    resetGraph: function () {
        this._clearHighlight();
    },

    destroy: function () {
        if (this.instance) { this.instance.destroy(); this.instance = null; }
    }
};
