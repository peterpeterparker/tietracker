import {useIonToast} from '@ionic/react';
import {useEffect} from 'react';

export const ErrorToast = () => {
  const [present] = useIonToast();

  const presentToast = async (message: string) => {
    console.log(message);

    await present({
      message,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {},
        },
      ],
    });
  };

  const onError = async ({detail}: CustomEvent<string>) => await presentToast(detail);

  useEffect(() => {
    // @ts-ignore
    document.addEventListener('tieError', onError, {passive: true});

    // @ts-ignore
    return () => document.removeEventListener('tieError', onError);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
