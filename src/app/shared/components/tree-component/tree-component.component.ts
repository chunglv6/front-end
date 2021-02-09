import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTree, MatTreeNestedDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';

export class TreeModel {
  children: Array<TreeModel>;
  name: string;
  isCheck: boolean;
}

@Component({
  selector: 'crm-tree-component',
  templateUrl: './tree-component.component.html',
  styleUrls: ['./tree-component.component.scss']
})
export class TreeComponentComponent implements OnInit, OnChanges {
  @ViewChild('tree') tree: MatTree<any>;
  @Input() treeData = [];
  nestedTreeControl: NestedTreeControl<TreeModel>;
  nestedDataSource: MatTreeNestedDataSource<TreeModel>;
  selectedData = new SelectionModel<any>();
  @Output() selectNode = new EventEmitter();
  @Input() isClickSearch = false;
  constructor() {
    this.nestedTreeControl = new NestedTreeControl<TreeModel>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    // build data lại dạng tree
    this.buildTree();
    this.nestedDataSource.data = this.treeData;
  }

  hasNestedChild = (_: number, nodeData: TreeModel) => nodeData.children.length > 0;

  private _getChildren = (node: TreeModel) => node.children;
  changeState(data) {
    data.expanded = !data.expanded;
  }
  chooseNode(item: any) {
    this.selectedData = item;
    this.selectNode.next(this.selectedData);
  }

  ngOnChanges() {
    this.buildTree();
    this.nestedDataSource.data = this.treeData;
    if (this.isClickSearch) {
      this.chooseNode(this.nestedDataSource.data[0]);
    }
  }
  buildTree() {
    this.treeData = this.treeData.map(x => {
      return {
        name: x.custName,
        type: 1,
        custId: x.custId,
        children: this.buildContract(x.custId, x.contracts),
        hasChildren: x.contracts && x.contracts.length > 0 ? true : false,
        expanded: false,
      };
    });
  }
  buildContract(custId: number, data: any) {
    if (data) {
      return data.map(d => {
        d.custId = custId;
        d.name = d.contractNo;
        d.type = 2;
        d.contractId = d.contractId;
        d.children = this.buildVehicle(custId, d.contractId, d.plateNumbers);
        d.hasChildren = d.plateNumbers && d.plateNumbers.length > 0 ? true : false;
        d.expanded = false;
        return d;
      });
    }
  }
  buildVehicle(custId: number, contractId: number, data: any) {
    if (data) {
      return data.map(d => {
        d.custId = custId;
        d.contractId = contractId;
        d.name = d.plateNumber;
        d.type = 3;
        d.vehicleId = d.vehicleId;
        return d;
      });
    }
  }
}
