import { useState, useEffect } from 'react';
import { Theme, WordSet } from './WordConfig';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
  useEffect(() => {
    function handleResize() { setWindowDimensions(getWindowDimensions()); } 

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowDimensions;
}

type Foo = Map<string, number>;

type MapKey<T> = T extends Map<infer K, any> ? K : never;
type MapValue<T> = T extends Map<any, infer V> ? V : never;

export function replacerForMap(key: any, value: any) : any {
  // if(value instanceof Map) {
  //   //console.log(`Map Stringifyed [Key=${key}]: ` + value.get("tech"));
  //   return { dataType: 'Map', values: new Array(value.entries())/* .map((tuple) => ({ key: tuple[0], value: tuple[1] })) */, /* or with spread: value: [...value] */};
  // }
  if(value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  return value;
}

export function reviverForMap(key: any, value: any) : any {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      console.log(`Map Parsed [Key=${key}]: `);
      return new Map(Object.entries<any>(value.values)/* .map(tuple => [tuple[0], decode(key, tuple[1])]) */);
    }
  }

  return value;
}

function decode(key: string, value: any) {
  if(typeof value === 'object' && value !== null) {
    if(key == 'word_sets') {
      console.log(`WordSet Parsed: ` + value.easy);
      return new WordSet(Object.values(value.easy), Object.values(value.hard));
    }

    if(key == 'themes') {
      console.log(`Theme Parsed: ` + value.name);
      return new Theme(value.name, value.description);
    }
  }

  return value;
}

export function getElementGetterTyped<T extends HTMLElement>(name: string, event: React.BaseSyntheticEvent<any, any, HTMLElement>) : T {
  return getElementTyped<T>(name, event.target);
}

export function getElementGetter(name: string, event: React.BaseSyntheticEvent<any, any, HTMLElement>) : HTMLElement {
  return getElement(name, event.target);
}

export function getElementTyped<T extends HTMLElement>(name: string, element: HTMLElement) : T {
  return getElement(name, element) as T;
}

export function getElement(name: string, element: HTMLElement) : HTMLElement {
  return element.ownerDocument.getElementsByName(name)[0]
}