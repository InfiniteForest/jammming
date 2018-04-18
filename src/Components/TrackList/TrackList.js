import React from 'react';
import {Track} from '../Track/Track.js';
import './TrackList.css';

export class TrackList extends React.Component {
  render() {
    return (
      <div className="TrackList">
        {
          this.props.tracks && this.props.tracks.map(track => <Track key={track.id} track={track} onAdd={this.props.onAdd} onRemove={this.props.onRemove} isRemoval={this.props.isRemoval} />)
        }
    </div>
    );
  }
}
