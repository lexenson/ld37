import React, { Component } from 'react';
import './App.css';
import Map, {Building} from './Map.js';
import Checkbox from 'rc-checkbox';
import moment from 'moment';
import uuid from 'uuid/v4';
import { maleRandomIt } from 'human-names'

const collectCashAudio = new Audio('assets/collect-cash.wav');

class App extends Component {
  constructor(props) {
    super(props);

    const properties = [
      this.generateProperty(),
      this.generateProperty(),
      this.generateProperty(),
      {
        name: 'Pizza Pasta Salate',
        actions: [{
          type: 'hire',
          cost: 100,
          duration: 15,
          info: {}
        }],
        id: uuid()
      },
      {
        name: 'FU Berlin',
        actions: [{
          type: 'learn',
          cost: 50,
          duration: 100,
          info: {}
        }]
      }
    ];

    const members = [
      this.generateMember()
    ];

    this.state = {
      members: members,
      properties: properties,
      money: 500,
      time: 0,
      menu: 'memberList'
    }

    window.setInterval(() => {
      const newProperties = this.updateProperties(this.state.properties);
      this.setState(Object.assign({}, this.state, {properties: newProperties, time: this.state.time + 1}));
    }, 200);
  }

  generateProperty() {
    const actions = [
      {
        type: 'steal',
        duration: 200,
        info: {
          difficulty: 20,
          reward: 10
        }
      }
    ]


    const type = ['bank', 'store', 'house'][Math.floor(Math.random()*3)];
    const owner = maleRandomIt();
    const difficulty = Math.round(Math.random() * 100);
    return {
      name: owner + '\'s ' + type.charAt(0).toUpperCase() + type.slice(1),
      actions,
      id: uuid()
    }
  }

  generateMember() {
    return  {
        name: maleRandomIt(),
        picture: 'assets/badguys/' + Math.floor(Math.random() * 9 + 1) + '.png',
        level: 1,
        selected: false,
        levelUpCost: 100,
        id: uuid(),
        assignedPropertyId: false
      }
  }

  updateProperties(properties) {
    return properties.map(property => property.mission ?
      Object.assign({}, property, {remainingTime: Math.max(0, property.mission.startTime + property.mission.action.duration - this.state.time)})
      : property
    );
  }

  handleEndMissionButton(mission, property) {
    const newMembers = this.state.members.map(member =>
      member.assignedPropertyId === property.id ? Object.assign({}, member, {assignedPropertyId: false}) : member
    );

    const newProperties = this.state.properties.map(p => p.id === property.id ?
      Object.assign({}, p, {mission: false}): p
    );

    let change;

    if (mission.action.type === 'steal') {
      change = this.endMissionSteal(mission.action.info);
    } else if (mission.action.type === 'hire') {
      change = this.endMissionHire(mission.action.info, newMembers);
    } else if (mission.action.type === 'learn') {
      change = this.endMissionLearn(mission.action.info, newMembers,  this.state.members.find(({assignedPropertyId}) => assignedPropertyId === property.id));
    }


    this.setState(Object.assign({}, this.state, {members: newMembers, properties: newProperties}, change));
  }

  endMissionSteal(info) {
    const successful =  Math.random()*100 > info.difficulty
    if (successful) {
      collectCashAudio.play();
      return {money: this.state.money + info.reward}
    }
    return {}
  }

  endMissionHire(info, members) {
    const newMembers = [...members, this.generateMember()];
    return {members: newMembers};
  }

  endMissionLearn(info, members, member) {
    const newMembers = members.map(m => member.id === m.id ? Object.assign({}, m, {level: m.level+1}) : m);
    return {members: newMembers};
  }

  handleFailureButton(missionId) {
    const newMembers = this.finishMission(this.state.members, missionId);
    const newMissions = this.resetMissions(this.state.missions, missionId);
    this.setState(Object.assign({}, this.state, {members: newMembers, missions: newMissions}));
  }

  handleAction(property, action) {
    if (action.cost > this.state.money) return
    const newMembers = this.state.members.map(member =>
      member.selected ? Object.assign({}, member, {selected: false, assignedPropertyId: property.id}) : member);

    const newProperties = this.state.properties.map(p => p.id === property.id ?
      Object.assign({}, p, {mission: {
        startTime: this.state.time,
        duration: action.duration,
        propertyId: property.id,
        action
      }}) : p
    );

    const newMoney = this.state.money - (action.cost ? action.cost : 0);

    this.setState(Object.assign({}, this.state, {money: newMoney, members: newMembers, properties: newProperties}));
  }

  toggleCheckbox(id) {
    const newMembers = this.state.members.map(member =>
      member.id === id ? Object.assign({}, member, {selected: !member.selected}) : member);
    this.setState(Object.assign({}, this.state, {members: newMembers}));
  }

  render() {
    return (
      <div className="App">
        <p>Time: {moment(this.state.time * 60 * 1000).format('HH:mm')}</p>
        <p>Money: ${this.state.money}</p>
        <Map
          width={600}
          height={500}
          nBlocksWide={4}
          nBlocksHigh={6}
          padding={30}
          buildings={[{x:0, y:0}, {x:2, y:3}]}
        />
        <MemberMenu
          members={this.state.members}
          missions={this.state.missions}
          toggleCheckbox={this.toggleCheckbox.bind(this)}/>
        <MissionMenu
          properties={this.state.properties}
          missions={this.state.missions}
          members={this.state.members}
          handleAction={this.handleAction.bind(this)}
          handleEndMissionButton={this.handleEndMissionButton.bind(this)}
          handleFailureButton={this.handleFailureButton.bind(this)}
          startButtonDisabled={this.state.members.every(({selected}) => !selected)}/>
      </div>
    );
  }
}

const MemberMenu = ({members, missions, toggleCheckbox}) => (
  <div className="MemberMenu">
    <p>
      List of gang members
    </p>
    <MemberList
      members={members}
      missions={missions}
      toggleCheckbox={toggleCheckbox} />
  </div>
);

const MemberList = ({members, missions, toggleCheckbox}) => (
  <div className="MemberList">
    <table>
      <thead>
        <tr>
          <th> Assign </th>
          <th> Picture </th>
          <th> Name </th>
          <th> Level </th>
          <th> Mission </th>
        </tr>
      </thead>
      <tbody>
        {members.map(member =>
          <Member
            key={member.id}
            {...member}
            toggleCheckbox={toggleCheckbox.bind(this, member.id)}/>)}
      </tbody>
    </table>
  </div>
);

const Member = ({name, picture, level, levelUpCost, assignedPropertyId, selected, mission, toggleCheckbox}) => (
    <tr className="Member">
      <td>
        {assignedPropertyId === false ? <Checkbox checked={selected} onChange={toggleCheckbox} /> : null}
      </td>
      <td> <img src={picture}/> </td>
      <td> {name} </td>
      <td> {level} </td>
      <td>
      </td>
      <td>
      </td>
   </tr>
);

const MissionMenu = ({properties, members, handleAction, handleEndMissionButton, handleFailureButton, startButtonDisabled}) => (
  <div className="MissionMenu">
    <p>
      Choose a mission
    </p>
    <PropertyList
      properties={properties}
      members={members}
      handleAction={handleAction}
      handleEndMissionButton={handleEndMissionButton}
      startButtonDisabled={startButtonDisabled}/>
  </div>
);

const PropertyList = ({properties, members, handleAction, startButtonDisabled, handleEndMissionButton}) => (
  <table className="PropertyList">
    <thead>
      <tr>
        <th> Name </th>
        <th> Address </th>
        <th>  </th>
      </tr>
    </thead>
    <tbody>
      {properties.map(property =>
        property.mission ?
        <Mission
          key={'mission-' + property.id}
          members={members.filter(({assignedPropertyId}) => assignedPropertyId === property.id)}
          property={property}
          mission={property.mission}
          handleEndMissionButton={handleEndMissionButton}
        />:
        <Property
          key={'property-' + property.id}
          property={property}
          handleAction={handleAction}
          startButtonDisabled={startButtonDisabled}/>)}
    </tbody>
  </table>
);

const Property = ({property, handleAction, startButtonDisabled}) => (
  <tr className="Mission grow">
    <td> {property.name} </td>
    <td> {property.address} </td>
    <td>
      {
        !startButtonDisabled ?
          property.actions.map(action =>
            <button key={action.type} onClick={handleAction.bind(this, property, action)}>
              {action.type.charAt(0).toUpperCase() + action.type.slice(1) + (action.cost ? '- $' + action.cost : '')}
            </button>
          ):
          null
      }
    </td>
  </tr>
);


const Mission = ({mission, property, members, handleEndMissionButton}) => (
  <tr className="Mission">
    <td>{property.name}</td>
    <td>{members.map(({name}) => name).join(", ")}</td>
    <td>
      {property.remainingTime === 0 ?
          <button onClick={handleEndMissionButton.bind(this, mission, property)}>End Mission</button>:
        <p>{moment.duration(property.remainingTime, 'minutes').humanize()}</p>}
    </td>
  </tr>
);

export default App;
