/* globals React ReactDOM d3 topojson*/

const PROJECT_NAME = "interactive-election-maps";
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

const GeoGroup = props => {
  // Component level vars
  var color = d3
    .scaleLinear()
    .domain([1, 16e4])
    .range(["red", "blue"]);

  // Set up props
  const { path, mapFileLocation, ...restProps } = props;

  // Set up component state
  const [geo, setGeo] = React.useState(null);
  const [state, setState] = React.useState(false);

  const loadJson = async fileLocation => {
    const data = await fetch(fileLocation);
    const topo = await data.json();
    const objects = Object.values(topo.objects); // Get array of objects so we don't need the name
    const geoJsonObject = topojson.feature(topo, objects[0]);

    setGeo(geoJsonObject);
  };

  const rnd = () => {
    return Math.ceil(Math.random() * 255);
  };

  // Load map file if not already loaded
  if (!geo) loadJson(mapFileLocation);

  return (
    <g className={"group"}>
      {geo &&
        geo.features.map((data, iteration) => (
          <path
            key={`path-${iteration}`}
            d={path(data)}
            className={"feature"}
            fill={color(data.properties.Area_SqKm)}
            fillOpacity={0.4}
            stroke={"rgba(255, 255, 255, 0.2"}
            strokeWidth={0.9}
          />
        ))}
      ))}
    </g>
  );
};

const GeoMap = props => {
  // Component level vars
  let projection;
  let path;

  // Set up component props
  const {
    width = 800,
    height = 600,
    mapFileLocation = "./topo/australia.json",
    focusPoint = [133.15399233370441, -24.656909465155994],
    margin = 64,
    fill = "#ddd",
    children,
    ...restProps
  } = props;

  // Set up component state
  const [geo, setGeo] = React.useState(null);

  // Component did mount?
  const componentDidMount = () => {
    return componentDidUnmount;
  };

  // Component did unmount?
  const componentDidUnmount = () => {};

  // Side effect after first mount
  React.useEffect(componentDidMount, []);

  // Used to rotate the projection
  const invertLongLat = longlat => {
    return [-longlat[0], -longlat[1]];
  };

  const loadJson = async fileLocation => {
    const data = await fetch(fileLocation);
    const topo = await data.json();
    const objects = Object.values(topo.objects); // Get array of objects so we don't need the name
    const geoJsonObject = topojson.feature(topo, objects[0]);

    setGeo(geoJsonObject);
  };

  // Load map file if not already loaded
  if (!geo) loadJson(mapFileLocation);
  else {
    projection = d3
      .geoMercator()
      .rotate(invertLongLat(focusPoint))
      .fitExtent(
        // Auto zoom
        [[margin, margin], [width - margin, height - margin]],
        geo
      );

    path = d3
      .geoPath()
      .projection(projection)
      .pointRadius(2);
  }

  return (
    <div className={"root"}>
      <svg className={"svg"} width={width} height={height}>
        {geo && (
          <g className={"group"}>
            {geo.features.map((data, iteration) => (
              <path
                key={`path-${iteration}`}
                d={path(data)}
                className={"feature"}
                fill={fill}
                stroke="white"
                strokeWidth={0.5}
              />
            ))}
          </g>
        )}
        {geo && (
          <g>
            <GeoGroup mapFileLocation={"topo/qld.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/nsw.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/act.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/nt.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/sa.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/tas.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/vic.topo.json"} path={path} />
            <GeoGroup mapFileLocation={"topo/wa.topo.json"} path={path} />
          </g>
        )}
      </svg>
    </div>
  );
};

const App = props => {
  return (
    <div className={"geo-map"}>
      <GeoMap
        width={window.innerWidth}
        height={window.innerHeight}
        mapFileLocation={"./topo/australia.json"}
        fill="#d1d1d1"
      />
    </div>
  );
};

function init() {
  ReactDOM.render(<App projectName={PROJECT_NAME} />, root);
}

init();
