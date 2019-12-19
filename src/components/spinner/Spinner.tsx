import React, { CSSProperties } from 'react';

import styles from './Spinner.module.scss';

import differenceInSeconds from 'date-fns/differenceInSeconds';

import { RootProps, rootConnector } from '../../store/thunks/index.thunks';

interface SpinnerProps extends RootProps {
    color: string | undefined;
}

interface SpinnerState {
    timeElapsed: string | undefined;
}

class Spinner extends React.Component<SpinnerProps, SpinnerState> {

    private progressInterval: number = -1;

    constructor(props: SpinnerProps) {
        super(props);

        this.state = {
          timeElapsed: undefined
        }
      }

    componentDidMount() {
        this.progressInterval = window.setInterval(() => {
            if (this.props.taskInProgress && this.props.taskInProgress.data) {
                const now: Date = new Date();

                let seconds: number = differenceInSeconds(now, this.props.taskInProgress.data.from);

                const diffHours: number = Math.floor(seconds / 3600);
                seconds = seconds % 3600;
                const diffMinutes: number = Math.floor(seconds / 60);
                const diffSeconds: number = seconds % 60;

                this.setState({timeElapsed: `${diffHours >= 99 ? '99' : (diffHours < 10 ? '0' + diffHours: diffHours)}:${diffMinutes < 10 ? '0' + diffMinutes: diffMinutes}:${diffSeconds < 10 ? '0' + diffSeconds: diffSeconds}`})
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.progressInterval);
    }

    render() {
        const inlineStyle = this.props.color !== undefined ? {'--progress-color': this.props.color} as CSSProperties : undefined;

        // https://codepen.io/supah/pen/BjYLdW
        return <div className={styles.container}>
            <svg className={styles.spinner} style={inlineStyle} viewBox="0 0 50 50">
                <circle className={styles.background} cx="25" cy="25" r="20"></circle>
                <circle className={styles.path} cx="25" cy="25" r="20"></circle>
            </svg>
            {
                this.state.timeElapsed !== undefined ? <h1 className={styles.text}>{this.state.timeElapsed}</h1> : undefined
            }
        </div>
    }

}

export default rootConnector(Spinner);
